package com.library.Resource.Sharing.Library.Management.recommendation.service;

import com.library.Resource.Sharing.Library.Management.model.Book;
import com.library.Resource.Sharing.Library.Management.recommendation.model.SparseVector;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.regex.Pattern;

@Slf4j
@Service
public class TfIdfService {

    private static final Pattern NON_ALPHANUMERIC = Pattern.compile("[^a-z0-9\\s]");
    private static final Pattern WHITESPACE = Pattern.compile("\\s+");

    // Standard English stop words
    private static final Set<String> STOP_WORDS = Set.of(
            "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are", "aren't",
            "as", "at", "be", "because", "been", "before", "being", "below", "between", "both", "but", "by",
            "can", "cannot", "could", "did", "do", "does", "doing", "don't", "down", "during", "each", "few",
            "for", "from", "further", "had", "has", "have", "having", "he", "he'd", "he'll", "he's", "her",
            "here", "here's", "hers", "herself", "him", "himself", "his", "how", "i", "i'd", "i'll", "i'm",
            "i've", "if", "in", "into", "is", "isn't", "it", "it's", "its", "itself", "let's", "me", "more",
            "most", "my", "myself", "no", "nor", "not", "of", "off", "on", "once", "only", "or", "other",
            "ought", "our", "ours", "ourselves", "out", "over", "own", "same", "she", "she'd", "she'll", "she's",
            "should", "so", "some", "such", "than", "that", "that's", "the", "their", "theirs", "them", "themselves",
            "then", "there", "there's", "these", "they", "they'd", "they'll", "they're", "they've", "this", "those",
            "through", "to", "too", "under", "until", "up", "very", "was", "wasn't", "we", "we'd", "we'll", "we're",
            "we've", "were", "weren't", "what", "what's", "when", "where", "which", "while", "who", "whom", "why",
            "with", "won't", "would", "you", "you'd", "you'll", "you're", "you've", "your", "yours", "yourself",
            "yourselves", "pdf", "edition", "vol", "volume", "chapter", "book"
    );

    // In-memory cache for fast vector retrieval
    private final Map<Long, SparseVector> vectorCache = new ConcurrentHashMap<>();
    private final Map<String, Double> idfCache = new ConcurrentHashMap<>();
    private volatile int corpusSize = 0;

    /**
     * Normalizes and cleans a text string.
     */
    public String normalizeText(String input) {
        if (input == null || input.isBlank()) {
            return "";
        }
        String lower = input.toLowerCase(Locale.ROOT);
        String cleaned = NON_ALPHANUMERIC.matcher(lower).replaceAll(" ");
        return WHITESPACE.matcher(cleaned).replaceAll(" ").trim();
    }

    /**
     * Tokenizes cleaned text into terms, discarding stopwords and tokens shorter than 2 chars.
     */
    public List<String> tokenize(String text) {
        String normalized = normalizeText(text);
        if (normalized.isEmpty()) {
            return Collections.emptyList();
        }
        String[] tokens = normalized.split(" ");
        List<String> result = new ArrayList<>(tokens.length);
        for (String token : tokens) {
            if (token.length() >= 2 && !STOP_WORDS.contains(token)) {
                result.add(token);
            }
        }
        return result;
    }

    /**
     * Extracts token frequencies from a Book, applying field importance weights:
     * - Title: 2.5x
     * - Tags: 2.0x
     * - Category: 2.0x
     * - Author Name & Bio: 1.5x
     * - Description: 1.0x
     */
    public Map<String, Double> extractWeightedTermCounts(Book book) {
        Map<String, Double> termCounts = new HashMap<>();

        if (book == null) {
            return termCounts;
        }

        // Title terms
        addWeightedTokens(termCounts, tokenize(book.getTitle()), 2.5);

        // Category terms
        if (book.getCategory() != null) {
            addWeightedTokens(termCounts, tokenize(book.getCategory()), 2.0);
        }

        // Tags terms
        if (book.getTags() != null) {
            addWeightedTokens(termCounts, tokenize(book.getTags()), 2.0);
        }

        // Author details
        if (book.getAuthor() != null) {
            addWeightedTokens(termCounts, tokenize(book.getAuthor().getName()), 1.5);
            if (book.getAuthor().getBio() != null) {
                addWeightedTokens(termCounts, tokenize(book.getAuthor().getBio()), 1.2);
            }
        }

        // Description terms
        if (book.getDescription() != null) {
            addWeightedTokens(termCounts, tokenize(book.getDescription()), 1.0);
        }

        return termCounts;
    }

    private void addWeightedTokens(Map<String, Double> termCounts, List<String> tokens, double weight) {
        for (String token : tokens) {
            termCounts.merge(token, weight, Double::sum);
        }
    }

    /**
     * Builds and caches TF-IDF vectors for a complete corpus of books.
     */
    public synchronized void trainCorpus(List<Book> books) {
        vectorCache.clear();
        idfCache.clear();

        if (books == null || books.isEmpty()) {
            corpusSize = 0;
            return;
        }

        corpusSize = books.size();
        Map<String, Integer> documentFrequency = new HashMap<>();
        Map<Long, Map<String, Double>> allTermCounts = new HashMap<>();

        // 1. Calculate Document Frequency (DF)
        for (Book book : books) {
            if (book == null || book.getBookId() == null) continue;
            Map<String, Double> counts = extractWeightedTermCounts(book);
            allTermCounts.put(book.getBookId(), counts);

            for (String term : counts.keySet()) {
                documentFrequency.merge(term, 1, Integer::sum);
            }
        }

        // 2. Compute Inverse Document Frequency (IDF) with standard smoothing
        for (Map.Entry<String, Integer> entry : documentFrequency.entrySet()) {
            String term = entry.getKey();
            int df = entry.getValue();
            double idf = Math.log((double) (corpusSize + 1) / (df + 1)) + 1.0;
            idfCache.put(term, idf);
        }

        // 3. Compute TF-IDF Sparse Vector for each book
        for (Map.Entry<Long, Map<String, Double>> entry : allTermCounts.entrySet()) {
            Long bookId = entry.getKey();
            Map<String, Double> counts = entry.getValue();

            double totalTokens = counts.values().stream().mapToDouble(Double::doubleValue).sum();
            if (totalTokens <= 0.0) {
                totalTokens = 1.0;
            }

            SparseVector vector = new SparseVector();
            for (Map.Entry<String, Double> termEntry : counts.entrySet()) {
                String term = termEntry.getKey();
                double count = termEntry.getValue();

                double tf = count / totalTokens;
                double idf = idfCache.getOrDefault(term, 1.0);
                vector.set(term, tf * idf);
            }
            vector.normalize();
            vectorCache.put(bookId, vector);
        }

        log.debug("Trained TF-IDF vector cache with {} documents and {} unique terms.", corpusSize, idfCache.size());
    }

    /**
     * Gets or generates a normalized TF-IDF vector for a single book.
     */
    public SparseVector getOrGenerateVector(Book book) {
        if (book == null || book.getBookId() == null) {
            return new SparseVector();
        }

        SparseVector cached = vectorCache.get(book.getBookId());
        if (cached != null) {
            return cached;
        }

        // Generate vector dynamically using current IDF vocabulary
        Map<String, Double> counts = extractWeightedTermCounts(book);
        double totalTokens = counts.values().stream().mapToDouble(Double::doubleValue).sum();
        if (totalTokens <= 0.0) totalTokens = 1.0;

        SparseVector vector = new SparseVector();
        for (Map.Entry<String, Double> entry : counts.entrySet()) {
            String term = entry.getKey();
            double count = entry.getValue();
            double tf = count / totalTokens;
            double idf = idfCache.getOrDefault(term, 1.0);
            vector.set(term, tf * idf);
        }
        vector.normalize();
        vectorCache.put(book.getBookId(), vector);
        return vector;
    }

    /**
     * Computes cosine similarity between two books.
     */
    public double computeSimilarity(Book b1, Book b2) {
        if (b1 == null || b2 == null) {
            return 0.0;
        }
        if (Objects.equals(b1.getBookId(), b2.getBookId())) {
            return 1.0;
        }
        SparseVector v1 = getOrGenerateVector(b1);
        SparseVector v2 = getOrGenerateVector(b2);
        return computeSimilarity(v1, v2);
    }

    /**
     * Computes cosine similarity between two vectors.
     */
    public double computeSimilarity(SparseVector v1, SparseVector v2) {
        if (v1 == null || v2 == null) {
            return 0.0;
        }
        return v1.cosineSimilarity(v2);
    }

    /**
     * Identifies top shared terms between two vectors (for explainable recommendations).
     */
    public List<String> findDominantSharedTerms(SparseVector v1, SparseVector v2, int maxTerms) {
        if (v1 == null || v2 == null) {
            return Collections.emptyList();
        }

        List<Map.Entry<String, Double>> sharedTerms = new ArrayList<>();
        for (String term : v1.getTerms()) {
            if (v2.contains(term)) {
                double score = v1.get(term) * v2.get(term);
                sharedTerms.add(new AbstractMap.SimpleEntry<>(term, score));
            }
        }

        sharedTerms.sort((a, b) -> Double.compare(b.getValue(), a.getValue()));

        List<String> result = new ArrayList<>();
        for (int i = 0; i < Math.min(maxTerms, sharedTerms.size()); i++) {
            result.add(sharedTerms.get(i).getKey());
        }
        return result;
    }

    /**
     * Invalidates the vector cache.
     */
    public void clearCache() {
        vectorCache.clear();
        idfCache.clear();
        corpusSize = 0;
    }
}
