<?php

namespace App\Console\Commands;

use App\Modules\Auth\Models\User;
use Illuminate\Console\Command;

class MakeUserAdmin extends Command
{
    protected $signature = 'user:make-admin {email} {role=admin : admin o super_admin}';

    protected $description = 'Asigna el rol admin o super_admin a un usuario existente por su correo';

    public function handle(): int
    {
        $role = $this->argument('role');

        if (! in_array($role, ['admin', 'super_admin'], true)) {
            $this->error('El rol debe ser admin o super_admin.');

            return self::FAILURE;
        }

        $user = User::where('email', $this->argument('email'))->first();

        if (! $user) {
            $this->error('No existe un usuario con ese correo.');

            return self::FAILURE;
        }

        $user->syncRoles([$role]);
        $this->info("{$user->email} ahora es {$role}.");

        return self::SUCCESS;
    }
}
