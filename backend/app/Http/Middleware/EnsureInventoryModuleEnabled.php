<?php

namespace App\Http\Middleware;

use App\Services\SiteSettings;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

// Módulo de inventario/costos: se activa o desactiva globalmente desde Admin → Ajustes.
class EnsureInventoryModuleEnabled
{
    public function handle(Request $request, Closure $next): Response
    {
        if (SiteSettings::get('inventory_module_enabled') !== true) {
            return response()->json([
                'success' => false,
                'message' => 'El módulo de inventario no está activo.',
            ], 403);
        }

        return $next($request);
    }
}
