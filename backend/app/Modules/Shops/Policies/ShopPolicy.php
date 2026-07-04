<?php

namespace App\Modules\Shops\Policies;

use App\Modules\Auth\Models\User;
use App\Modules\Shops\Models\Shop;
use Illuminate\Auth\Access\HandlesAuthorization;

class ShopPolicy
{
    use HandlesAuthorization;

    public function viewAny(User $user): bool
    {
        return true; // Public can view active shops
    }

    public function view(User $user, Shop $shop): bool
    {
        if ($shop->status === 'active') {
            return true;
        }

        // Owner or admin can view their own shop even if not active
        if ($shop->user_id === $user->id) {
            return true;
        }

        return $user->hasRole(['super_admin', 'admin', 'moderator']);
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('shops.create') || $user->hasRole(['vendor', 'super_admin', 'admin']);
    }

    public function update(User $user, Shop $shop): bool
    {
        if ($shop->user_id === $user->id) {
            return $user->hasPermissionTo('shops.update') || $user->hasRole(['vendor']);
        }

        return $user->hasRole(['super_admin', 'admin']);
    }

    public function delete(User $user, Shop $shop): bool
    {
        return $shop->user_id === $user->id || $user->hasRole(['super_admin', 'admin']);
    }

    public function approve(User $user): bool
    {
        return $user->hasRole(['super_admin', 'admin', 'moderator']);
    }

    public function reject(User $user): bool
    {
        return $user->hasRole(['super_admin', 'admin', 'moderator']);
    }

    public function suspend(User $user): bool
    {
        return $user->hasRole(['super_admin', 'admin', 'moderator']);
    }

    public function toggleFeatured(User $user): bool
    {
        return $user->hasRole(['super_admin', 'admin']);
    }

    public function toggleVerified(User $user): bool
    {
        return $user->hasRole(['super_admin', 'admin']);
    }

    public function manageBenefits(User $user): bool
    {
        return $user->hasRole(['super_admin', 'admin']);
    }
}