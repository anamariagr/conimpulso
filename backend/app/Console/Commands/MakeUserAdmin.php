<?php

namespace App\Console\Commands;

use App\Modules\Auth\Models\User;
use Illuminate\Console\Command;

class MakeUserAdmin extends Command
{
    protected $signature = 'user:make-admin {email}';

    protected $description = 'Asigna el rol admin a un usuario existente por su correo';

    public function handle(): int
    {
        $user = User::where('email', $this->argument('email'))->first();

        if (! $user) {
            $this->error('No existe un usuario con ese correo.');

            return self::FAILURE;
        }

        $user->syncRoles(['admin']);
        $this->info("{$user->email} ahora es admin.");

        return self::SUCCESS;
    }
}
