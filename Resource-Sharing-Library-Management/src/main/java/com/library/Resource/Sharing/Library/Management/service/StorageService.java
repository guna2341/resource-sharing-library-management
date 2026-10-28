    package com.library.Resource.Sharing.Library.Management.service;

    import com.library.Resource.Sharing.Library.Management.enums.Bucket;
    import org.springframework.beans.factory.annotation.Value;
    import org.springframework.stereotype.Service;
    import org.springframework.web.multipart.MultipartFile;
    import software.amazon.awssdk.core.sync.RequestBody;
    import software.amazon.awssdk.services.s3.S3Client;
    import software.amazon.awssdk.services.s3.model.GetObjectRequest;
    import software.amazon.awssdk.services.s3.model.PutObjectRequest;
    import software.amazon.awssdk.services.s3.presigner.S3Presigner;
    import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
    import software.amazon.awssdk.services.s3.presigner.model.PresignedGetObjectRequest;

    import java.io.IOException;
    import java.time.Duration;
    import java.util.Map;
    import java.util.UUID;

    @Service
    public class StorageService {

        private final S3Client s3Client;

        private final S3Presigner s3Presigner;

        private final Map<Bucket, String> storageBuckets;

        @Value("${supabase.url:https://fziqmrelkosjdkbyvsij.supabase.co}")
        private String supabaseUrl;

        public StorageService(S3Client s3Client, Map<Bucket, String> storageBuckets, S3Presigner s3Presigner) {
            this.s3Client = s3Client;
            this.storageBuckets = storageBuckets;
            this.s3Presigner = s3Presigner;
        }

        public String uploadFile(MultipartFile file, Bucket bucket) throws IOException {

            String fileName = UUID.randomUUID() + "-" + file.getOriginalFilename();
            PutObjectRequest request = PutObjectRequest.builder()
                    .bucket(storageBuckets.get(bucket))
                    .key(fileName)
                    .contentType(file.getContentType())
                    .build();
            s3Client.putObject(
                    request,
                    RequestBody.fromBytes(file.getBytes())
            );

            return fileName;
        }

        public String getPublicUrl(String fileName, Bucket bucket) {
            String url = supabaseUrl
                    + "/storage/v1/object/public/"
                    + storageBuckets.get(bucket)
                    + "/"
                    + fileName;
            url = url.replaceAll("\\s+","%20");
            return url;
        }

        public String getPresignedUrl(String fileName) {

            GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                    .bucket(storageBuckets.get(Bucket.DOCUMENTS))
                    .key(fileName)
                    .build();

            GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
                    .signatureDuration(Duration.ofMinutes(120))
                    .getObjectRequest(getObjectRequest)
                    .build();

            PresignedGetObjectRequest presignedRequest = s3Presigner.presignGetObject(presignRequest);

            return presignedRequest.url().toString();
        }

    }
