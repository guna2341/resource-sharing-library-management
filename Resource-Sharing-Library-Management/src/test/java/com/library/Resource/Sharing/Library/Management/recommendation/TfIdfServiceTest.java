package com.library.Resource.Sharing.Library.Management.recommendation;

import com.library.Resource.Sharing.Library.Management.model.Author;
import com.library.Resource.Sharing.Library.Management.model.Book;
import com.library.Resource.Sharing.Library.Management.recommendation.model.SparseVector;
import com.library.Resource.Sharing.Library.Management.recommendation.service.TfIdfService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class TfIdfServiceTest {

    private TfIdfService tfIdfService;

    @BeforeEach
    void setUp() {
        tfIdfService = new TfIdfService();
    }

    @Test
    @DisplayName("Text normalization should lowercase, remove punctuation, and trim")
    void testNormalizeText() {
        String input = "  Distributed Consensus: Multi-Paxos & Raft, 2nd Edition!  ";
        String normalized = tfIdfService.normalizeText(input);
        assertEquals("distributed consensus multi paxos raft 2nd edition", normalized);

        // Null and blank handling
        assertEquals("", tfIdfService.normalizeText(null));
        assertEquals("", tfIdfService.normalizeText("   "));
    }

    @Test
    @DisplayName("Tokenization should discard stopwords and single-character tokens")
    void testTokenize() {
        String text = "The principles of quantum cryptography in a modern world";
        List<String> tokens = tfIdfService.tokenize(text);

        assertFalse(tokens.contains("the"));
        assertFalse(tokens.contains("of"));
        assertFalse(tokens.contains("in"));
        assertFalse(tokens.contains("a"));

        assertTrue(tokens.contains("principles"));
        assertTrue(tokens.contains("quantum"));
        assertTrue(tokens.contains("cryptography"));
        assertTrue(tokens.contains("modern"));
        assertTrue(tokens.contains("world"));
    }

    @Test
    @DisplayName("Term count extraction should boost title, category, and tags")
    void testExtractWeightedTermCounts() {
        Author author = Author.builder().authorId(1L).name("Evelyn Vasquez").bio("Distributed Systems Chair").build();
        Book book = Book.builder()
                .bookId(101L)
                .title("Distributed Consensus")
                .category("Computer Science")
                .tags("Paxos, Raft")
                .description("A monograph on cloud consensus.")
                .author(author)
                .build();

        Map<String, Double> counts = tfIdfService.extractWeightedTermCounts(book);

        assertNotNull(counts.get("distributed"));
        assertNotNull(counts.get("consensus"));
        assertNotNull(counts.get("paxos"));
        assertNotNull(counts.get("raft"));
        assertNotNull(counts.get("science"));

        // Title terms receive 2.5 weight
        assertTrue(counts.get("consensus") >= 2.5);
    }

    @Test
    @DisplayName("Identical resources should yield a cosine similarity of 1.0")
    void testCosineSimilarityIdentical() {
        Author author = Author.builder().authorId(1L).name("Marcus Chen").build();
        Book book1 = Book.builder()
                .bookId(1L)
                .title("Quantum Computing Foundations")
                .category("Physics")
                .tags("Qubits, Superposition")
                .description("Introduction to quantum mechanics.")
                .author(author)
                .build();

        Book book2 = Book.builder()
                .bookId(2L)
                .title("Quantum Computing Foundations")
                .category("Physics")
                .tags("Qubits, Superposition")
                .description("Introduction to quantum mechanics.")
                .author(author)
                .build();

        tfIdfService.trainCorpus(List.of(book1, book2));

        double sim = tfIdfService.computeSimilarity(book1, book2);
        assertEquals(1.0, sim, 0.001);
    }

    @Test
    @DisplayName("Orthogonal/unrelated resources should yield a cosine similarity near 0.0")
    void testCosineSimilarityOrthogonal() {
        Author authorA = Author.builder().authorId(1L).name("Alice Smith").build();
        Author authorB = Author.builder().authorId(2L).name("Bob Jones").build();

        Book bookQuantum = Book.builder()
                .bookId(1L)
                .title("Quantum Qubits Cryptography Entanglement")
                .category("Physics")
                .tags("Lattice, PostQuantum")
                .author(authorA)
                .build();

        Book bookGardening = Book.builder()
                .bookId(2L)
                .title("Organic Vegetable Gardening Soil Cultivation")
                .category("Agriculture")
                .tags("Compost, Fertilizer, Tomatoes")
                .author(authorB)
                .build();

        tfIdfService.trainCorpus(List.of(bookQuantum, bookGardening));

        double sim = tfIdfService.computeSimilarity(bookQuantum, bookGardening);
        assertEquals(0.0, sim, 0.001);
    }

    @Test
    @DisplayName("SparseVector L2 normalization and cosine dot product")
    void testSparseVectorMath() {
        SparseVector v1 = new SparseVector();
        v1.set("distributed", 3.0);
        v1.set("systems", 4.0);

        assertEquals(5.0, v1.norm(), 0.001); // 3-4-5 right triangle

        v1.normalize();
        assertEquals(1.0, v1.norm(), 0.001);
        assertEquals(0.6, v1.get("distributed"), 0.001);
        assertEquals(0.8, v1.get("systems"), 0.001);

        SparseVector v2 = new SparseVector();
        v2.set("distributed", 1.0);
        v2.normalize();

        double sim = v1.cosineSimilarity(v2);
        assertEquals(0.6, sim, 0.001);
    }

    @Test
    @DisplayName("Empty corpus and null metadata handling")
    void testEmptyCorpus() {
        assertDoesNotThrow(() -> tfIdfService.trainCorpus(null));
        assertDoesNotThrow(() -> tfIdfService.trainCorpus(List.of()));

        Book nullFieldsBook = Book.builder().bookId(999L).build();
        SparseVector vector = tfIdfService.getOrGenerateVector(nullFieldsBook);
        assertNotNull(vector);
        assertTrue(vector.isEmpty());
    }
}
