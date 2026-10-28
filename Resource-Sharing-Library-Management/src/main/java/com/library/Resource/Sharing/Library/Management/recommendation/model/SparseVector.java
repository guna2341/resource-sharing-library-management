package com.library.Resource.Sharing.Library.Management.recommendation.model;

import lombok.Getter;

import java.io.Serializable;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;

/**
 * High-performance sparse vector representation for term-weight mappings in TF-IDF.
 */
public class SparseVector implements Serializable {

    @Getter
    private final Map<String, Double> weights;
    private double norm = -1.0;

    public SparseVector() {
        this.weights = new HashMap<>();
    }

    public SparseVector(Map<String, Double> weights) {
        this.weights = new HashMap<>(weights);
    }

    public void set(String term, double weight) {
        if (term != null && !term.isBlank() && weight > 0) {
            weights.put(term, weight);
            norm = -1.0; // Invalidate cached norm
        }
    }

    public double get(String term) {
        return weights.getOrDefault(term, 0.0);
    }

    public boolean contains(String term) {
        return weights.containsKey(term);
    }

    public Set<String> getTerms() {
        return Collections.unmodifiableSet(weights.keySet());
    }

    public int size() {
        return weights.size();
    }

    public boolean isEmpty() {
        return weights.isEmpty();
    }

    /**
     * Calculates the Euclidean (L2) norm of this vector.
     */
    public double norm() {
        if (norm >= 0.0) {
            return norm;
        }
        double sum = 0.0;
        for (double w : weights.values()) {
            sum += w * w;
        }
        norm = Math.sqrt(sum);
        return norm;
    }

    /**
     * Normalizes this vector in-place to unit length (L2 norm = 1.0).
     */
    public SparseVector normalize() {
        double currentNorm = norm();
        if (currentNorm > 0.0) {
            for (Map.Entry<String, Double> entry : weights.entrySet()) {
                entry.setValue(entry.getValue() / currentNorm);
            }
            norm = 1.0;
        }
        return this;
    }

    /**
     * Calculates the dot product between this vector and another sparse vector.
     */
    public double dot(SparseVector other) {
        if (other == null || this.isEmpty() || other.isEmpty()) {
            return 0.0;
        }

        // Iterate through the smaller vector for O(min(|A|, |B|)) efficiency
        SparseVector smaller = this.size() <= other.size() ? this : other;
        SparseVector larger = this.size() <= other.size() ? other : this;

        double dot = 0.0;
        for (Map.Entry<String, Double> entry : smaller.weights.entrySet()) {
            Double otherWeight = larger.weights.get(entry.getKey());
            if (otherWeight != null) {
                dot += entry.getValue() * otherWeight;
            }
        }
        return dot;
    }

    /**
     * Calculates cosine similarity: cos(u, v) = (u . v) / (||u|| * ||v||).
     * Returns a normalized score between 0.0 and 1.0.
     */
    public double cosineSimilarity(SparseVector other) {
        if (other == null || this.isEmpty() || other.isEmpty()) {
            return 0.0;
        }
        double normA = this.norm();
        double normB = other.norm();
        if (normA == 0.0 || normB == 0.0) {
            return 0.0;
        }
        double dot = this.dot(other);
        double similarity = dot / (normA * normB);
        return Math.max(0.0, Math.min(1.0, similarity));
    }

    /**
     * Accumulates another vector scaled by a given multiplier (for building user interest profiles).
     */
    public void addScaled(SparseVector other, double scale) {
        if (other == null || other.isEmpty() || scale <= 0.0) {
            return;
        }
        for (Map.Entry<String, Double> entry : other.weights.entrySet()) {
            weights.merge(entry.getKey(), entry.getValue() * scale, Double::sum);
        }
        norm = -1.0;
    }
}
