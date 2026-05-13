'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Bell, ChevronRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import BottomNav from '@/components/BottomNav';
import Logo from '@/components/Logo';
import { Box, Button, Flex, Text } from '@chakra-ui/react';

export default function SettingsPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  async function handleSignOut() {
    setLoading(true);
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <Flex
      direction="column"
      minH="100vh"
      pb={20}
      style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}
    >
      <Box as="header" px={6} pt={6} pb={6}>
        <Logo size={36} />
        <Text fontSize="2xl" fontWeight="bold" color="gray.900" mt={4}>Settings</Text>
      </Box>

      <Flex as="main" flex={1} direction="column" px={6} gap={4}>
        <Box
          bg="white"
          borderRadius="2xl"
          borderWidth="1px"
          borderColor="gray.100"
          shadow="sm"
          overflow="hidden"
        >
          <Flex
            as="button"
            align="center"
            justify="space-between"
            w="full"
            h={14}
            px={4}
            borderBottomWidth="1px"
            borderColor="gray.100"
            _active={{ bg: 'gray.50' }}
          >
            <Flex align="center" gap={3}>
              <Bell size={18} color="#0F6E56" />
              <Text fontSize="sm" fontWeight="medium" color="gray.800">Notifications</Text>
            </Flex>
            <ChevronRight size={16} color="#9CA3AF" />
          </Flex>
        </Box>

        <Button
          onClick={handleSignOut}
          loading={loading}
          loadingText="Signing out…"
          h={12}
          w="full"
          bg="red.50"
          color="red.600"
          fontWeight="semibold"
          borderRadius="xl"
          borderWidth="1px"
          borderColor="red.200"
          variant="outline"
          _hover={{ bg: 'red.100' }}
          _active={{ bg: 'red.100' }}
        >
          <LogOut size={18} />
          Sign out
        </Button>
      </Flex>

      <BottomNav />
    </Flex>
  );
}
