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
        Storage::putFileAs('public/uploads/' . $type . 's', $file, $filename);

        // Use the API file-serve route — works without storage:link and without nginx config
        $publicUrl = url('/api/files/' . $type . 's/' . $filename);

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

    public function index(): JsonResponse
    {
        $folders = ['images', 'videos', 'gifs', 'documents'];
        $items = [];

        foreach ($folders as $folder) {
            $dir = 'public/uploads/' . $folder;
            if (!Storage::exists($dir)) continue;

            foreach (Storage::files($dir) as $file) {
                $filename = basename($file);
                $items[] = [
                    'url'      => url('/api/files/' . $folder . '/' . $filename),
                    'filename' => $filename,
                    'folder'   => $folder,
                    'size'     => Storage::size($file),
                    'modified' => Storage::lastModified($file),
                ];
            }
        }

        usort($items, fn($a, $b) => $b['modified'] - $a['modified']);

        return response()->json(['data' => $items]);
    }

    public function serve(string $folder, string $filename): \Illuminate\Http\Response|\Illuminate\Http\JsonResponse
    {
        $path = 'public/uploads/' . $folder . '/' . $filename;

        if (!Storage::exists($path)) {
            return response()->json(['message' => 'File not found'], 404);
        }

        $file = Storage::get($path);
        $mime = Storage::mimeType($path);

        return response($file, 200)
            ->header('Content-Type', $mime)
            ->header('Cache-Control', 'public, max-age=31536000, immutable');
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

        // Convertir URL completa a path de storage
        if (str_contains($path, '/api/files/')) {
            // Nuevo formato: http://host/api/files/{folder}/{filename}
            preg_match('#/api/files/([^/]+)/(.+)$#', $path, $m);
            $path = isset($m[1], $m[2]) ? 'public/uploads/' . $m[1] . '/' . $m[2] : '';
        } elseif (str_contains($path, '/storage/')) {
            // Formato viejo: http://host/storage/uploads/...
            $path = 'public/' . preg_replace('#^.*/storage/#', '', $path);
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
