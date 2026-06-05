<?php

namespace App\Modules\Products\Policies;

use App\Modules\Auth\Models\User;
use App\Modules\Products\Models\Product;
use Illuminate\Auth\Access\HandlesAuthorization;

class ProductPolicy
{
    use HandlesAuthorization;

    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Product $product): bool
    {
        if ($product->status === 'active') {
            return true;
        }

        if ($user && $product->shop && $product->shop->user_id === $user->id) {
            return true;
        }

        return $user && $user->hasRole(['super_admin', 'admin', 'moderator']);
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('products.create') || $user->hasRole(['vendor', 'super_admin', 'admin']);
    }

    public function update(User $user, Product $product): bool
    {
        if ($product->shop && $product->shop->user_id === $user->id) {
            return $user->hasPermissionTo('products.update') || $user->hasRole(['vendor']);
        }

        return $user->hasRole(['super_admin', 'admin']);
    }

    public function delete(User $user, Product $product): bool
    {
        if ($product->shop && $product->shop->user_id === $user->id) {
            return $user->hasPermissionTo('products.delete') || $user->hasRole(['vendor']);
        }

        return $user->hasRole(['super_admin', 'admin']);
    }

    public function toggleFeatured(User $user): bool
    {
        return $user->hasRole(['super_admin', 'admin']);
    }
}