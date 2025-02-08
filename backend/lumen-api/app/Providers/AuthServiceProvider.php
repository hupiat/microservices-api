<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Auth;
use Tymon\JWTAuth\JWTGuard;
use Tymon\JWTAuth\Providers\Auth\Illuminate as JWTAuthProvider;

class AuthServiceProvider extends ServiceProvider
{
    public function register()
    {
        //
    }

    public function boot()
    {
        Auth::extend('jwt', function ($app, $name, array $config) {
            return new JWTGuard(
                new JWTAuthProvider(Auth::createUserProvider($config['provider'])),
                Auth::createUserProvider($config['provider']),
                $app['request']
            );
        });

        // Ensure Lumen uses JWT authentication
        Auth::viaRequest('api', function ($request) {
            return Auth::guard('jwt')->user();
        });
    }
}

