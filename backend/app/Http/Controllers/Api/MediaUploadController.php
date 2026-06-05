<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class MediaUploadController extends Controller
{
    public function upload(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'file' => 'required|file|max:102400', // 100MB max
            'type' => 'required|in:image,video,gif,document',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $file = $request->file('file');
        $type = $request->input('type');

        // Determine allowed mime types based on type
        $allowedMimes = match($type) {
            'image' => ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
            'video' => ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'],
            'gif' => ['image/gif'],
            'document' => ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
            default => [],
        };

        if (!in_array($file->getMimeType(), $allowedMimes)) {
            return response()->json([
                'success' => false,
                'message' => 'File type not allowed for type: ' . $type,
            ], 422);
        }

        // Generate unique filename
        $filename = $type . '_' . time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
        $path = 'uploads/' . $type . 's/' . $filename;

        // Store the file
        $url = Storage::putFileAs('public/' . 'uploads/' . $type . 's', $file, $filename);

        // Get the public URL
        $publicUrl = url('/storage/' . $path);

        return response()->json([
            'success' => true,
            'data' => [
                'url' => $publicUrl,
                'filename' => $filename,
                'path' => $path,
                'mime_type' => $file->getMimeType(),
                'size' => $file->getSize(),
            ],
            'message' => 'File uploaded successfully',
        ], 201);
    }

    public function delete(Request $request): JsonResponse
    {
        $path = $request->input('path');

        if (!$path) {
            return response()->json([
                'success' => false,
                'message' => 'Path is required',
            ], 422);
        }

        // Extract path from full URL if needed
        if (str_contains($path, 'storage/')) {
            $path = str_replace(url('/storage/'), '', $path);
            $path = 'public/' . $path;
        }

        if (Storage::exists($path)) {
            Storage::delete($path);
            return response()->json([
                'success' => true,
                'message' => 'File deleted successfully',
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'File not found',
        ], 404);
    }
}
