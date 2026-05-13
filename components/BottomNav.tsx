'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Upload, Settings } from 'lucide-react';
import { Box, Flex, Text } from '@chakra-ui/react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/upload', label: 'Upload', icon: Upload },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <Box
      as="nav"
      position="fixed"
      bottom={0}
      left="50%"
      transform="translateX(-50%)"
      w="full"
      maxW="480px"
      bg="white"
      borderTopWidth="1px"
      borderColor="gray.200"
      sx={{ paddingBottom: 'max(0px, env(safe-area-inset-bottom))' }}
    >
      <Flex justify="space-around">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href} style={{ flex: 1 }}>
              <Flex
                direction="column"
                align="center"
                justify="center"
                py={3}
                minH="56px"
                gap={1}
                color={active ? 'brand.500' : 'gray.500'}
                transition="color 0.2s"
              >
                <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
                <Text fontSize="xs" fontWeight="medium">{label}</Text>
              </Flex>
            </Link>
          );
        })}
      </Flex>
    </Box>
  );
}
