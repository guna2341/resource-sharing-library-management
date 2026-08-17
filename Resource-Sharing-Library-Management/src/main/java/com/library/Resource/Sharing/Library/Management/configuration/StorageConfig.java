package com.library.Resource.Sharing.Library.Management.configuration;

import com.library.Resource.Sharing.Library.Management.enums.Bucket;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Map;

@Configuration
public class StorageConfig {

    @Bean
    public Map<Bucket, String> storageBuckets(@Value("${supabase.s3.buckets.images}") String imageBucket, @Value("${supabase.s3.buckets.documents}") String documentBucket) {
        return Map.of(
                Bucket.IMAGES, imageBucket,
                Bucket.DOCUMENTS, documentBucket
        );
    }
}