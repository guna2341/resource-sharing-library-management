package com.library.Resource.Sharing.Library.Management.recommendation;

import com.library.Resource.Sharing.Library.Management.controller.RecommendationController;
import com.library.Resource.Sharing.Library.Management.recommendation.dto.RecommendedResourceDto;
import com.library.Resource.Sharing.Library.Management.recommendation.service.RecommendationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class RecommendationControllerTest {

    private MockMvc mockMvc;

    @Mock
    private RecommendationService recommendationService;

    @BeforeEach
    void setUp() {
        RecommendationController controller = new RecommendationController(recommendationService);
        mockMvc = MockMvcBuilders.standaloneSetup(controller).build();
    }

    @Test
    @DisplayName("GET /api/v1/recommendations/for-me should return 200 with list of recommendations")
    void testGetPersonalizedRecommendations() throws Exception {
        RecommendedResourceDto dto = RecommendedResourceDto.builder()
                .bookId(101L)
                .title("Distributed Systems")
                .recommendationReason("Matches your reading profile")
                .score(0.92)
                .build();

        when(recommendationService.getPersonalizedRecommendations(any(), anyInt()))
                .thenReturn(List.of(dto));

        mockMvc.perform(get("/api/v1/recommendations/for-me?limit=5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].bookId").value(101))
                .andExpect(jsonPath("$.data[0].title").value("Distributed Systems"))
                .andExpect(jsonPath("$.data[0].recommendationReason").value("Matches your reading profile"));
    }

    @Test
    @DisplayName("GET /api/v1/recommendations/similar/{bookId} should return 200 with similar resources")
    void testGetSimilarResources() throws Exception {
        RecommendedResourceDto dto = RecommendedResourceDto.builder()
                .bookId(102L)
                .title("Quantum Cryptography")
                .recommendationReason("Similar content")
                .score(0.85)
                .build();

        when(recommendationService.getSimilarResources(anyLong(), anyInt()))
                .thenReturn(List.of(dto));

        mockMvc.perform(get("/api/v1/recommendations/similar/101?limit=3"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].bookId").value(102));
    }

    @Test
    @DisplayName("GET /api/v1/recommendations/trending should return 200 with trending resources")
    void testGetTrendingResources() throws Exception {
        RecommendedResourceDto dto = RecommendedResourceDto.builder()
                .bookId(103L)
                .title("Deep Learning")
                .score(0.95)
                .build();

        when(recommendationService.getTrendingResources(anyInt()))
                .thenReturn(List.of(dto));

        mockMvc.perform(get("/api/v1/recommendations/trending?limit=4"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].bookId").value(103));
    }
}
