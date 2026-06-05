<?php

namespace App\Services;

use App\Modules\Auth\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class UserImportService
{
    public function importFromCsv(string $filePath, int $createdBy): array
    {
        $handle = fopen($filePath, 'r');
        $headers = fgetcsv($handle);

        $results = [
            'imported' => 0,
            'failed' => 0,
            'errors' => [],
        ];

        $rowNumber = 1;
        while (($data = fgetcsv($handle)) !== false) {
            $rowNumber++;
            $row = array_combine($headers, $data);

            try {
                $this->validateRow($row);
                $this->createUser($row, $createdBy);
                $results['imported']++;
            } catch (ValidationException $e) {
                $results['failed']++;
                $results['errors'][] = "Row {$rowNumber}: " . implode(', ', $e->errors());
            } catch (\Exception $e) {
                $results['failed']++;
                $results['errors'][] = "Row {$rowNumber}: " . $e->getMessage();
            }
        }

        fclose($handle);
        return $results;
    }

    private function validateRow(array $row): void
    {
        $validator = Validator::make($row, [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
            'phone' => 'sometimes|nullable|string|max:20',
            'role' => 'sometimes|in:client,vendor,advisor',
        ]);

        if ($validator->fails()) {
            throw new ValidationException($validator);
        }
    }

    private function createUser(array $row, int $createdBy): User
    {
        return DB::transaction(function () use ($row, $createdBy) {
            $user = User::create([
                'name' => $row['name'],
                'email' => $row['email'],
                'password' => bcrypt($row['password']),
                'phone' => $row['phone'] ?? null,
                'role' => $row['role'] ?? 'client',
                'created_by' => $createdBy,
            ]);

            return $user;
        });
    }

    public function getTemplate(): array
    {
        return [
            'name' => 'Nombre completo',
            'email' => 'correo@ejemplo.com',
            'password' => 'contraseña123',
            'phone' => '3001234567 (opcional)',
            'role' => 'client|vendor|advisor (opcional, default: client)',
        ];
    }
}