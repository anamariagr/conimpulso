<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Modules\Shops\Models\Category;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Alimentos y Bebidas',
                'icon' => '🍽️',
                'order' => 1,
                'children' => [
                    ['name' => 'Bebidas', 'icon' => '🥤', 'order' => 1],
                    ['name' => 'Snacks', 'icon' => '🍿', 'order' => 2],
                    ['name' => 'Dulces', 'icon' => '🍬', 'order' => 3],
                    ['name' => 'Conservas', 'icon' => '🥫', 'order' => 4],
                    ['name' => 'Productos orgánicos', 'icon' => '🥬', 'order' => 5],
                ],
            ],
            [
                'name' => 'Textiles y Ropa',
                'icon' => '👕',
                'order' => 2,
                'children' => [
                    ['name' => 'Ropa hombre', 'icon' => '👔', 'order' => 1],
                    ['name' => 'Ropa mujer', 'icon' => '👗', 'order' => 2],
                    ['name' => 'Ropa infantil', 'icon' => '👶', 'order' => 3],
                    ['name' => 'Calzado', 'icon' => '👟', 'order' => 4],
                    ['name' => 'Accesorios', 'icon' => '👜', 'order' => 5],
                ],
            ],
            [
                'name' => 'Artesanía',
                'icon' => '🎨',
                'order' => 3,
                'children' => [
                    ['name' => 'Cerámica', 'icon' => '🏺', 'order' => 1],
                    ['name' => 'Madera', 'icon' => '🪵', 'order' => 2],
                    ['name' => 'Metal', 'icon' => '⚙️', 'order' => 3],
                    ['name' => 'Vidrio', 'icon' => '🔮', 'order' => 4],
                    ['name' => 'Cuero', 'icon' => '🧶', 'order' => 5],
                ],
            ],
            [
                'name' => 'Tecnología',
                'icon' => '💻',
                'order' => 4,
                'children' => [
                    ['name' => 'Electrónica', 'icon' => '📱', 'order' => 1],
                    ['name' => 'Accesorios', 'icon' => '🖱️', 'order' => 2],
                    ['name' => 'Componentes', 'icon' => '🔧', 'order' => 3],
                ],
            ],
            [
                'name' => 'Muebles',
                'icon' => '🪑',
                'order' => 5,
                'children' => [
                    ['name' => 'Sala', 'icon' => '🛋️', 'order' => 1],
                    ['name' => 'Cocina', 'icon' => '🍳', 'order' => 2],
                    ['name' => 'Oficina', 'icon' => '🖥️', 'order' => 3],
                    ['name' => 'Exterior', 'icon' => '🌳', 'order' => 4],
                ],
            ],
            [
                'name' => 'Metalurgia',
                'icon' => '⚙️',
                'order' => 6,
                'children' => [
                    ['name' => 'Herramientas', 'icon' => '🔨', 'order' => 1],
                    ['name' => 'Decoración', 'icon' => '🏗️', 'order' => 2],
                    ['name' => 'Industrial', 'icon' => '🏭', 'order' => 3],
                ],
            ],
            [
                'name' => 'Servicios',
                'icon' => '🔧',
                'order' => 7,
                'children' => [
                    ['name' => 'Técnicos', 'icon' => '🔧', 'order' => 1],
                    ['name' => 'Técnicos de computadores', 'icon' => '💻', 'order' => 2],
                    ['name' => 'Programadores', 'icon' => '👨‍💻', 'order' => 3],
                    ['name' => 'Reparación de celulares', 'icon' => '📱', 'order' => 4],
                    ['name' => 'Reparación', 'icon' => '🛠️', 'order' => 5],
                    ['name' => 'Consultoría', 'icon' => '📊', 'order' => 6],
                    ['name' => 'Diseño', 'icon' => '🎨', 'order' => 7],
                    ['name' => 'Diseñadores gráficos', 'icon' => '🖌️', 'order' => 8],
                    ['name' => 'Ilustradores', 'icon' => '✏️', 'order' => 9],
                    ['name' => 'Soporte técnico IT', 'icon' => '🖥️', 'order' => 10],
                    ['name' => 'Mantenimiento de equipos', 'icon' => '⚙️', 'order' => 11],
                    ['name' => 'Instalación de redes', 'icon' => '🌐', 'order' => 12],
                ],
            ],
        ];

        foreach ($categories as $catData) {
            $children = $catData['children'] ?? [];
            unset($catData['children']);

            $parent = Category::firstOrCreate(
                ['slug' => \Illuminate\Support\Str::slug($catData['name'])],
                $catData
            );

            foreach ($children as $childData) {
                Category::firstOrCreate(
                    ['slug' => \Illuminate\Support\Str::slug($childData['name'])],
                    array_merge($childData, ['parent_id' => $parent->id])
                );
            }
        }
    }
}