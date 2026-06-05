<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        // Roles del sistema
        $roles = [
            'super_admin' => 'Administrador total del sistema',
            'admin' => 'Administrador de plataforma',
            'moderator' => 'Moderador de contenido',
            'support' => 'Soporte al cliente',
            'logistics_operator' => 'Operador logístico',
            'vendor' => 'Vendedor/Tienda',
            'advisor' => 'Asesor comercial',
            'client' => 'Cliente final',
            'allied_company' => 'Empresa aliada',
        ];

        foreach ($roles as $name => $description) {
            Role::firstOrCreate(['name' => $name, 'guard_name' => 'web']);
        }

        // Permisos por módulo
        $permissions = [
            // Users
            'users.view',
            'users.create',
            'users.update',
            'users.delete',
            'users.manage-roles',

            // Shops
            'shops.view',
            'shops.create',
            'shops.update',
            'shops.delete',
            'shops.approve',
            'shops.suspend',

            // Products
            'products.view',
            'products.create',
            'products.update',
            'products.delete',
            'products.export',
            'products.import',

            // Services
            'services.view',
            'services.create',
            'services.update',
            'services.delete',

            // Leads
            'leads.view',
            'leads.create',
            'leads.update',
            'leads.delete',
            'leads.unlock',
            'leads.export',

            // Wallet
            'wallet.view',
            'wallet.deposit',
            'wallet.withdraw',
            'wallet.transfer',

            // Logistics
            'logistics.view',
            'logistics.create',
            'logistics.update',
            'logistics.delete',
            'logistics.manage-routes',
            'logistics.generate-labels',

            // Advertising
            'advertising.view',
            'advertising.create',
            'advertising.campaigns',
            'advertising.analytics',

            // Advisors
            'advisors.view',
            'advisors.manage',
            'advisors.commissions',

            // Reports
            'reports.view',
            'reports.export',
            'reports.financial',

            // Settings
            'settings.view',
            'settings.update',
            'settings.advanced',

            // Moderation
            'moderation.view',
            'moderation.delete',
            'moderation.suspend-users',
            'moderation.suspend-shops',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission, 'guard_name' => 'web']);
        }

        // Asignar permisos a super_admin (todos)
        $superAdmin = Role::findByName('super_admin');
        $superAdmin->givePermissionTo(Permission::all());

        // Admin tiene casi todos menos settings advanced
        $admin = Role::findByName('admin');
        $admin->givePermissionTo(Permission::whereNot('name', 'settings.advanced')->get());

        // Moderator
        $moderator = Role::findByName('moderator');
        $moderator->givePermissionTo([
            'users.view',
            'shops.view',
            'shops.approve',
            'shops.suspend',
            'products.view',
            'products.delete',
            'services.view',
            'services.delete',
            'moderation.view',
            'moderation.delete',
            'moderation.suspend-users',
            'moderation.suspend-shops',
        ]);

        // Vendor
        $vendor = Role::findByName('vendor');
        $vendor->givePermissionTo([
            'shops.view',
            'shops.create',
            'shops.update',
            'products.view',
            'products.create',
            'products.update',
            'products.delete',
            'services.view',
            'services.create',
            'services.update',
            'services.delete',
            'leads.view',
            'leads.update',
            'wallet.view',
            'wallet.deposit',
            'advertising.view',
            'advertising.create',
            'advertising.campaigns',
            'reports.view',
        ]);

        // Advisor
        $advisor = Role::findByName('advisor');
        $advisor->givePermissionTo([
            'products.view',
            'services.view',
            'leads.view',
            'leads.create',
            'wallet.view',
            'reports.view',
        ]);

        // Client
        $client = Role::findByName('client');
        $client->givePermissionTo([
            'products.view',
            'services.view',
            'leads.view',
            'leads.create',
            'wallet.view',
        ]);
    }
}