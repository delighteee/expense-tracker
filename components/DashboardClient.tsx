'use client';

import Link from 'next/link';
import { Upload } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import { Box, Button, Circle, Flex, Text } from '@chakra-ui/react';

interface Transaction {
  id: string;
  narration: string | null;
  beneficiary: string | null;
  bank: string;
  category: string | null;
  date: string;
  amount: number;
  direction: 'debit' | 'credit';
}

interface Props {
  name: string;
  hasTransactions: boolean;
  totalSpend: number;
  transactions: Transaction[];
}

export default function DashboardClient({ name, hasTransactions, totalSpend, transactions }: Props) {
  return (
    <Flex direction="column" minH="100vh" pb={20} style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}>
      {/* Header */}
      <Box as="header" px={6} pt={4} pb={6} bg="brand.500" color="white">
        <Text fontSize="sm" color="whiteAlpha.700">Welcome back</Text>
        <Text fontSize="2xl" fontWeight="bold" mt={0.5}>{name} 👋</Text>
        {hasTransactions && (
          <Box mt={4} bg="whiteAlpha.200" borderRadius="2xl" p={4}>
            <Text fontSize="sm" color="whiteAlpha.700">Total spend (recent)</Text>
            <Text fontSize="3xl" fontWeight="bold" mt={1}>
              ₦{totalSpend.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
            </Text>
          </Box>
        )}
      </Box>

      {/* Content */}
      <Box as="main" flex={1} px={6} pt={6}>
        {!hasTransactions ? (
          <Flex direction="column" align="center" justify="center" py={20} textAlign="center">
            <Circle size="80px" bg="brand.50" mb={4}>
              <Upload size={32} color="#0F6E56" />
            </Circle>
            <Text fontSize="lg" fontWeight="semibold" color="gray.800">No transactions yet</Text>
            <Text fontSize="sm" color="gray.500" mt={2} maxW="xs">
              Upload a bank receipt or statement to start tracking your expenses
            </Text>
            <Link href="/upload">
              <Button
                mt={6}
                h={12}
                px={8}
                borderRadius="xl"
                fontWeight="semibold"
                colorPalette="brand"
              >
                <Upload size={18} />
                Upload receipt
              </Button>
            </Link>
          </Flex>
        ) : (
          <Flex direction="column" gap={3}>
            <Text fontSize="base" fontWeight="semibold" color="gray.800">Recent transactions</Text>
            {transactions.map((t) => (
              <Box
                key={t.id}
                bg="white"
                borderRadius="2xl"
                p={4}
                borderWidth="1px"
                borderColor="gray.100"
                shadow="sm"
              >
                <Flex align="flex-start" justify="space-between" gap={3}>
                  <Box flex={1} minW={0}>
                    <Text fontSize="sm" fontWeight="medium" color="gray.900" truncate>
                      {t.narration || t.beneficiary || 'Transaction'}
                    </Text>
                    <Text fontSize="xs" color="gray.500" mt={0.5}>
                      {t.bank} · {t.category ?? 'Uncategorised'}
                    </Text>
                    <Text fontSize="xs" color="gray.400" mt={0.5}>{t.date}</Text>
                  </Box>
                  <Text
                    fontSize="md"
                    fontWeight="bold"
                    whiteSpace="nowrap"
                    color={t.direction === 'credit' ? 'brand.500' : 'gray.900'}
                  >
                    {t.direction === 'credit' ? '+' : '-'}
                    ₦{Number(t.amount).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                  </Text>
                </Flex>
              </Box>
            ))}
          </Flex>
        )}
      </Box>

      <BottomNav />
    </Flex>
  );
}
