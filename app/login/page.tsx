'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Logo from '@/components/Logo';
import {
  Alert, AlertDescription, Box, Button, Divider,
  Flex, FormControl, FormLabel, HStack, Input, Text,
} from '@chakra-ui/react';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push('/dashboard');
      router.refresh();
    }
  }

  async function handleGoogleLogin() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${location.origin}/auth/callback` },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    }
  }

  return (
    <Flex
      direction="column"
      minH="100vh"
      px={6}
      sx={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}
    >
      <Flex direction="column" align="center" pt={16} pb={10}>
        <Logo size={56} />
        <Text mt={3} color="gray.500" fontSize="sm">Track your Nigerian bank expenses</Text>
      </Flex>

      <Box as="form" onSubmit={handleEmailLogin} display="flex" flexDirection="column" gap={4}>
        {error && (
          <Alert status="error" borderRadius="xl" fontSize="sm">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <FormControl>
          <FormLabel htmlFor="email" fontSize="sm" fontWeight="medium" color="gray.700">Email</FormLabel>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            h={12}
            borderRadius="xl"
            placeholder="you@example.com"
          />
        </FormControl>

        <FormControl>
          <FormLabel htmlFor="password" fontSize="sm" fontWeight="medium" color="gray.700">Password</FormLabel>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            h={12}
            borderRadius="xl"
            placeholder="••••••••"
          />
        </FormControl>

        <Button
          type="submit"
          isLoading={loading}
          loadingText="Signing in…"
          h={12}
          borderRadius="xl"
          fontWeight="semibold"
          mt={2}
          colorScheme="brand"
        >
          Sign in
        </Button>
      </Box>

      <HStack my={6}>
        <Divider />
        <Text fontSize="xs" color="gray.400" fontWeight="medium" whiteSpace="nowrap">OR</Text>
        <Divider />
      </HStack>

      <Button
        onClick={handleGoogleLogin}
        isDisabled={loading}
        h={12}
        borderRadius="xl"
        variant="outline"
        borderColor="gray.300"
        color="gray.700"
        bg="white"
        _hover={{ bg: 'gray.50' }}
        leftIcon={
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
            <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
          </svg>
        }
      >
        Continue with Google
      </Button>

      <Text textAlign="center" fontSize="sm" color="gray.500" mt={8}>
        No account?{' '}
        <Link href="/signup">
          <Text as="span" color="brand.500" fontWeight="semibold">Sign up</Text>
        </Link>
      </Text>
    </Flex>
  );
}
