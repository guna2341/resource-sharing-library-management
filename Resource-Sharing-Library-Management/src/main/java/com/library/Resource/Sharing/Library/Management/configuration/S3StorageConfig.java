package com.library.Resource.Sharing.Library.Management.configuration;

import com.library.Resource.Sharing.Library.Management.service.StorageService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;

import java.net.URI;

@Configuration
public class S3StorageConfig {

    @Value("${supabase.s3.endpoint:${SUPABASE_ENDPOINT:https://fziqmrelkosjdkbyvsij.storage.supabase.co/storage/v1/s3}}")
    private String endpoint;

    @Value("${supabase.s3.region:${SUPABASE_REGION:ap-south-1}}")
    private String region;

    @Value("${supabase.s3.access-key:${SUPABASE_ACCESS_KEY:c0d7b6f00a91975c6cda09f423103477}}")
    private String accessKey;

    @Value("${supabase.s3.secret-key:${SUPABASE_SECRET_KEY:b0a951b5ac957e2266d895b223c506d98f0f3c4d6bb21fa0f6b3dced738797d2}}")
    private String secretKey;

    private final Logger LOGGER = LoggerFactory.getLogger(S3StorageConfig.class);


    @Bean
    public S3Client s3Client() {

        AwsBasicCredentials basicCredentials = AwsBasicCredentials.create(accessKey, secretKey);
        LOGGER.info(endpoint);
        return S3Client.builder()
                .endpointOverride(URI.create(endpoint))
                .region(Region.of(region))
                .credentialsProvider(StaticCredentialsProvider.create(basicCredentials))
                .forcePathStyle(true)
                .build();

    }

    @Bean
    public S3Presigner s3Presigner() {
        AwsBasicCredentials credentials =
                AwsBasicCredentials.create(accessKey, secretKey);

        return S3Presigner.builder()
                .endpointOverride(URI.create(endpoint))
                .region(Region.of(region))
                .credentialsProvider(
                        StaticCredentialsProvider.create(credentials)
                )
                .serviceConfiguration(
                        software.amazon.awssdk.services.s3.S3Configuration.builder()
                                .pathStyleAccessEnabled(true)
                                .build()
                )
                .build();
    }

}
