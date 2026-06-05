<?php

namespace App\Modules\Shops\Policies;

use App\Modules\Auth\Models\User;
use App\Modules\Shops\Models\Category;
use Illuminate\Auth\Access\HandlesAuthorization;

class CategoryPolicy
{
    use HandlesAuthorization;

    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Category $category): bool
    {
        if ($category->is_active) {
            return true;
        }

        return $user->hasRole(['super_admin', 'admin', 'moderator']);
    }

    public function create(User $user): bool
    {
        return $user->hasRole(['super_admin', 'admin']);
    }

    public function update(User $user, Category $category): bool
    {
        return $user->hasRole(['super_admin', 'admin']);
    }

    public function delete(User $user, Category $category): bool
    {
        return $user->hasRole(['super_admin', 'admin']);
    }
}