'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Logo from '@/components/Logo';
import {
  Alert, Box, Button, Field, Flex,
  Grid, Input, Text,
} from '@chakra-ui/react';

const BANKS = [
  'GTBank', 'Access', 'Zenith', 'First Bank', 'UBA',
  'Opay', 'Palmpay', 'Kuda', 'Sterling', 'FCMB', 'Other',
];

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedBanks, setSelectedBanks] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function toggleBank(bank: string) {
    setSelectedBanks((prev) =>
      prev.includes(bank) ? prev.filter((b) => b !== bank) : [...prev, bank]
    );
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    if (selectedBanks.length === 0) {
      setError('Please select at least one bank.');
      return;
    }
    setLoading(true);
    setError('');

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, banks: selectedBanks } },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      await supabase.from('users').upsert({ id: data.user.id, name });
    }

    router.push('/onboarding');
    router.refresh();
  }

  return (
    <Flex
      direction="column"
      minH="100vh"
      px={6}
      pb={8}
      style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}
    >
      <Flex direction="column" align="center" pt={12} pb={8}>
        <Logo size={48} />
        <Text mt={2} color="gray.500" fontSize="sm">Create your account</Text>
      </Flex>

      <Box as="form" onSubmit={handleSignup} display="flex" flexDirection="column" gap={4}>
        {error && (
          <Alert.Root status="error" borderRadius="xl" fontSize="sm">
            <Alert.Indicator />
            <Alert.Description>{error}</Alert.Description>
          </Alert.Root>
        )}

        <Field.Root>
          <Field.Label fontSize="sm" fontWeight="medium" color="gray.700">Full Name</Field.Label>
          <Input
            type="text"
            autoComplete="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            h={12}
            borderRadius="xl"
            placeholder="Chukwuemeka Obi"
            colorPalette="brand"
          />
        </Field.Root>

        <Field.Root>
          <Field.Label fontSize="sm" fontWeight="medium" color="gray.700">Email</Field.Label>
          <Input
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            h={12}
            borderRadius="xl"
            placeholder="you@example.com"
            colorPalette="brand"
          />
        </Field.Root>

        <Field.Root>
          <Field.Label fontSize="sm" fontWeight="medium" color="gray.700">Password</Field.Label>
          <Input
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            h={12}
            borderRadius="xl"
            placeholder="Minimum 8 characters"
            colorPalette="brand"
          />
        </Field.Root>

        <Box display="flex" flexDirection="column" gap={2}>
          <Text fontSize="sm" fontWeight="medium" color="gray.700">Your Banks</Text>
          <Text fontSize="xs" color="gray.500">Select all banks you use</Text>
          <Grid templateColumns="repeat(2, 1fr)" gap={2}>
            {BANKS.map((bank) => {
              const selected = selectedBanks.includes(bank);
              return (
                <Button
                  key={bank}
                  type="button"
                  onClick={() => toggleBank(bank)}
                  h={11}
                  borderRadius="xl"
                  variant={selected ? 'subtle' : 'outline'}
                  colorPalette={selected ? 'brand' : undefined}
                  borderColor={selected ? 'brand.500' : 'gray.300'}
                  color={selected ? 'brand.500' : 'gray.700'}
                  bg={selected ? 'brand.50' : 'white'}
                  fontSize="sm"
                  fontWeight="medium"
                  _hover={{}}
                >
                  {bank}
                </Button>
              );
            })}
          </Grid>
        </Box>

        <Button
          type="submit"
          loading={loading}
          loadingText="Creating account…"
          h={12}
          borderRadius="xl"
          fontWeight="semibold"
          mt={2}
          colorPalette="brand"
        >
          Create account
        </Button>
      </Box>

      <Text textAlign="center" fontSize="sm" color="gray.500" mt={6}>
        Already have an account?{' '}
        <Link href="/login">
          <Text as="span" color="brand.500" fontWeight="semibold">Sign in</Text>
        </Link>
      </Text>
    </Flex>
  );
}
