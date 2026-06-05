<?php

namespace Database\Seeders;

use App\Modules\Membership\Models\MembershipPlan;
use Illuminate\Database\Seeder;

class MembershipPlanSeeder extends Seeder
{
    public function run(): void
    {
        $plans = [
            [
                'name' => 'Básico',
                'slug' => 'basic',
                'description' => 'Perfecto para emprendedores que inician en el marketplace.',
                'price_monthly' => 9.99,
                'price_yearly' => 99.99,
                'currency' => 'USD',
                'features' => [
                    'Hasta 50 productos',
                    '5 categorías permitidas',
                    'Estadísticas básicas',
                    'Soporte por email',
                ],
                'limits' => [
                    'products' => 50,
                    'categories' => 5,
                    'banner_featured' => false,
                    'priority_support' => false,
                    'analytics_advanced' => false,
                    'api_access' => false,
                    'custom_url' => false,
                ],
                'is_active' => true,
                'sort_order' => 1,
            ],
            [
                'name' => 'Profesional',
                'slug' => 'professional',
                'description' => 'Ideal para negocios establecidos que buscan crecer.',
                'price_monthly' => 29.99,
                'price_yearly' => 299.99,
                'currency' => 'USD',
                'features' => [
                    'Hasta 500 productos',
                    '20 categorías',
                    'Producto destacado en首页',
                    'Soporte prioritario',
                    'Estadísticas básicas',
                    'Acceso a API',
                ],
                'limits' => [
                    'products' => 500,
                    'categories' => 20,
                    'banner_featured' => true,
                    'priority_support' => true,
                    'analytics_advanced' => false,
                    'api_access' => true,
                    'custom_url' => false,
                ],
                'is_active' => true,
                'sort_order' => 2,
            ],
            [
                'name' => 'Empresarial',
                'slug' => 'enterprise',
                'description' => 'Para empresas que necesitan el máximo rendimiento.',
                'price_monthly' => 99.99,
                'price_yearly' => 999.99,
                'currency' => 'USD',
                'features' => [
                    'Productos ilimitados',
                    'Categorías ilimitadas',
                    'Banner destacado',
                    'Soporte prioritario 24/7',
                    'Estadísticas avanzadas',
                    'Acceso completo a API',
                    'URL personalizada',
                    'Gestor de cuenta dedicado',
                ],
                'limits' => [
                    'products' => -1,
                    'categories' => -1,
                    'banner_featured' => true,
                    'priority_support' => true,
                    'analytics_advanced' => true,
                    'api_access' => true,
                    'custom_url' => true,
                ],
                'is_active' => true,
                'sort_order' => 3,
            ],
        ];

        foreach ($plans as $plan) {
            MembershipPlan::updateOrCreate(
                ['slug' => $plan['slug']],
                $plan
            );
        }
    }
}