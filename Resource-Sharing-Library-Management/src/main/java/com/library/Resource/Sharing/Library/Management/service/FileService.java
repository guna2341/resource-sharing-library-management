package com.library.Resource.Sharing.Library.Management.service;

import com.library.Resource.Sharing.Library.Management.dto.response.ApiResponse;
import com.library.Resource.Sharing.Library.Management.enums.Bucket;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;

@Service
@AllArgsConstructor
public class FileService {

    private StorageService storageService;

    private Bucket getFileType(MultipartFile file) {

        String contentType = file.getContentType();

        Bucket bucket;

        if (contentType != null && contentType.startsWith("image/")) {
            bucket = Bucket.IMAGES;
        } else {
            bucket = Bucket.DOCUMENTS;
        }

        return bucket;
    }

    public ApiResponse uploadSingleFile(MultipartFile file) {

        String fileKey;

        Bucket fileType = getFileType(file);

        try {
            fileKey = storageService.uploadFile(file, fileType);
        }
        catch (IOException ex) {
            return new ApiResponse(false, "Failed to upload file.", ex.getMessage());
        }

        String responseUrl = fileKey;

        if (fileType.equals(Bucket.IMAGES)) {
            responseUrl = storageService.getPublicUrl(fileKey, Bucket.IMAGES);
        }
        return new ApiResponse(true, "File saved successfully", responseUrl);
    }

    public ApiResponse uploadMultipleFiles(MultipartFile[] files) {
        return new ApiResponse(true, "Files saved successfully.", new ArrayList<>(Arrays.asList("url1", "url2")));
    }

}
