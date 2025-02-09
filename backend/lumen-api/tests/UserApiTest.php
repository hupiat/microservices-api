<?php

namespace Tests;

use Laravel\Lumen\Testing\DatabaseMigrations;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserApiTest extends TestCase
{
    use DatabaseMigrations;

    protected $headers = [];

    public function setUp(): void
    {
        parent::setUp();
        $this->artisan('migrate');
    }

    public function test_can_register_user()
    {
        $response = $this->json('POST', '/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'Password123',
            'password_confirmation' => 'Password123'
        ]);

        $response->seeStatusCode(201)
                 ->seeJsonContains(['email' => 'test@example.com']);
    }

    public function test_can_login_user()
    {
        $user = User::create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => Hash::make('Password123')
        ]);

        $response = $this->json('POST', '/login', [
            'email' => 'test@example.com',
            'password' => 'Password123'
        ]);

        fwrite(STDERR, "\n[DEBUG] Register Response:\n" . $response->response->getContent());

        $response->seeStatusCode(200)
                 ->seeJsonStructure(['token']);

        $this->headers = ['Authorization' => 'Bearer ' . json_decode($response->response->getContent(), true)['token']];
    }

    public function test_can_get_all_users()
    {
        User::factory()->count(3)->create();
        $this->json('GET', '/users', [], $this->headers)
             ->seeStatusCode(200)
             ->seeJsonStructure([['id', 'name', 'email']]);
    }

    public function test_can_get_single_user()
    {
        $user = User::factory()->create();
        $this->json('GET', "/users/{$user->id}", [], $this->headers)
             ->seeStatusCode(200)
             ->seeJsonContains(['email' => $user->email]);
    }

    public function test_can_update_user()
    {
        $user = User::factory()->create();
        $response = $this->json('PUT', "/users/{$user->id}", [
            'email' => 'test@example.com',
            'name' => 'Updated Name',
            'password' => 'NewPassword123'
        ], $this->headers);

        $response->seeStatusCode(200)
                 ->seeJsonContains(['name' => 'Updated Name']);
    }

    public function test_can_delete_user()
    {
        $user = User::factory()->create();
        $this->json('DELETE', "/users/{$user->id}", [], $this->headers)
             ->seeStatusCode(200);
    }
}
