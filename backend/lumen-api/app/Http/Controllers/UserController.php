<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Tymon\JWTAuth\Facades\JWTAuth;
use Laravel\Lumen\Routing\Controller as BaseController;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;

class UserController extends BaseController
{
    public function register(Request $request)
    {
        $data = $request->all();
        \Log::info("🔍 Data received for registration:", $data);

        $this->validate($request, [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6',
        ]);

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => app('hash')->make($data['password']),
        ]);

        \Log::info("✅ User created successfully: ", $user->toArray());

        return response()->json($user, 201);
    }

    public function login(Request $request)
    {
        $credentials = $request->only('email', 'password');

        if (!$token = Auth::guard('jwt')->attempt($credentials)) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        return response()->json(compact('token'));
    }

    public function logout()
    {
        JWTAuth::invalidate(JWTAuth::getToken());
        return response()->json(['message' => 'Logged out successfully']);
    }

    public function getUsers()
    {
        return response()->json(User::all());
    }

    public function getUser($id)
    {
        $user = User::find($id);
        if (!$user) return response()->json(['error' => 'User not found'], 404);
        return response()->json($user);
    }

    public function updateUser(Request $request, $id)
    {
        $data = json_decode($request->getContent(), true);
        if (is_array($data)) {
            $request->merge($data);
        } else {
            return response()->json(['error' => 'Invalid JSON format'], 400);
        }
        $user = User::find($id);
        if (!$user) return response()->json(['error' => 'User not found'], 404);

        $validator = $this->validateRequest($request, $id);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 422);
        }

        $user->update($request->all());
        return response()->json($user);
    }

    public function deleteUser($id)
    {
        $user = User::find($id);
        if (!$user) return response()->json(['error' => 'User not found'], 404);

        $user->delete();
        return response()->json($user);
    }

    private function validateRequest($request, $userId)
    {
        $rules = [
            'name' => 'required|string',
            'email' => 'required|email|unique:users,email,' . $userId,
        ];
    
        if (!$userId) {
            $rules['password'] = 'required|min:6';
        } else {
            $rules['password'] = 'nullable|min:6';
        }
    
        return Validator::make($request->all(), $rules);
    }
}
