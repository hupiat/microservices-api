<?php

/** @var \Laravel\Lumen\Routing\Router $router */

/*
|--------------------------------------------------------------------------
| Application Routes
|--------------------------------------------------------------------------
|
| Here is where you can register all of the routes for an application.
| It is a breeze. Simply tell Lumen the URIs it should respond to
| and give it the Closure to call when that URI is requested.
|
*/

$router->post('/login', 'UserController@login');
$router->post('/logout', ['middleware' => 'auth', 'uses' => 'UserController@logout']);

$router->get('/users', 'UserController@getUsers');
$router->get('/users/{id}', 'UserController@getUser');
$router->post('/register', 'UserController@register');
$router->put('/users/{id}', 'UserController@updateUser');
$router->delete('/users/{id}', 'UserController@deleteUser');
