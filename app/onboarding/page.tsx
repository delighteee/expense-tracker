'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, Upload, Bell } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import Logo from '@/components/Logo';
import {
  Box, Button, Circle, Flex, Grid, Text,
} from '@chakra-ui/react';

const BANKS = [
  'GTBank', 'Access', 'Zenith', 'First Bank', 'UBA',
  'Opay', 'Palmpay', 'Kuda', 'Sterling', 'FCMB', 'Other',
];

type Step = 'banks' | 'receipt' | 'notifications';

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();
  const [step, setStep] = useState<Step>('banks');
  const [selectedBanks, setSelectedBanks] = useState<string[]>([]);
  const [notifLoading, setNotifLoading] = useState(false);

  function toggleBank(bank: string) {
    setSelectedBanks((prev) =>
      prev.includes(bank) ? prev.filter((b) => b !== bank) : [...prev, bank]
    );
  }

  async function handleBanksContinue() {
    if (selectedBanks.length === 0) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.auth.updateUser({ data: { banks: selectedBanks } });
    }
    setStep('receipt');
  }

  async function handleNotifications() {
    setNotifLoading(true);
    if ('Notification' in window) {
      await Notification.requestPermission();
    }
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('notification_prefs').upsert({
        user_id: user.id,
        wa_weekly: true,
        wa_monthly: true,
        push_weekly: true,
        push_monthly: true,
      });
    }
    router.push('/dashboard');
    router.refresh();
  }

  const steps: Record<Step, number> = { banks: 1, receipt: 2, notifications: 3 };
  const currentStep = steps[step];

  return (
    <Flex
      direction="column"
      minH="100vh"
      px={6}
      pb={8}
      style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}
    >
      {/* Progress */}
      <Box pt={8} pb={6}>
        <Logo size={36} />
        <Flex gap={2} mt={6}>
          {[1, 2, 3].map((s) => (
            <Box
              key={s}
              h="6px"
              flex={1}
              borderRadius="full"
              bg={s <= currentStep ? 'brand.500' : 'gray.200'}
              transition="background 0.3s"
            />
          ))}
        </Flex>
        <Text fontSize="xs" color="gray.400" mt={2}>Step {currentStep} of 3</Text>
      </Box>

      {step === 'banks' && (
        <Flex direction="column" gap={6}>
          <Box>
            <Text fontSize="xl" fontWeight="bold" color="gray.900">Your banks</Text>
            <Text fontSize="sm" color="gray.500" mt={1}>
              Which banks do you use? We&apos;ll help categorise your transactions.
            </Text>
          </Box>
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
                  variant="outline"
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
          <Button
            onClick={handleBanksContinue}
            disabled={selectedBanks.length === 0}
            h={12}
            borderRadius="xl"
            fontWeight="semibold"
            colorPalette="brand"
          >
            Continue
          </Button>
        </Flex>
      )}

      {step === 'receipt' && (
        <Flex direction="column" gap={6}>
          <Box>
            <Text fontSize="xl" fontWeight="bold" color="gray.900">Upload your first receipt</Text>
            <Text fontSize="sm" color="gray.500" mt={1}>
              Take a photo of a bank receipt or debit alert SMS to log your first transaction.
            </Text>
          </Box>
          <Flex
            direction="column"
            align="center"
            gap={4}
            bg="brand.50"
            borderRadius="2xl"
            p={8}
            borderWidth="2px"
            borderStyle="dashed"
            borderColor="brand.500"
            opacity={0.7}
          >
            <Circle size="64px" bg="brand.500">
              <Upload size={28} color="white" />
            </Circle>
            <Text fontSize="sm" textAlign="center" color="gray.600">
              Tap to upload a receipt image
            </Text>
            <Button
              onClick={() => setStep('notifications')}
              h={11}
              px={6}
              borderRadius="xl"
              fontSize="sm"
              fontWeight="semibold"
              colorPalette="brand"
            >
              Upload Receipt
            </Button>
          </Flex>
          <Button
            variant="plain"
            onClick={() => setStep('notifications')}
            fontSize="sm"
            color="gray.500"
            textDecoration="underline"
          >
            Skip for now
          </Button>
        </Flex>
      )}

      {step === 'notifications' && (
        <Flex direction="column" gap={6}>
          <Box>
            <Text fontSize="xl" fontWeight="bold" color="gray.900">Stay on top of your spending</Text>
            <Text fontSize="sm" color="gray.500" mt={1}>
              Get weekly and monthly spending summaries via push notifications.
            </Text>
          </Box>
          <Flex
            direction="column"
            align="center"
            gap={4}
            bg="brand.50"
            borderRadius="2xl"
            p={6}
          >
            <Circle size="64px" bg="brand.500">
              <Bell size={28} color="white" />
            </Circle>
            <Flex direction="column" gap={2} w="full">
              {[
                { label: 'Weekly spending summary', desc: 'Every Monday morning' },
                { label: 'Monthly report', desc: 'First of every month' },
              ].map((item) => (
                <Flex
                  key={item.label}
                  align="center"
                  gap={3}
                  bg="white"
                  borderRadius="xl"
                  p={3}
                >
                  <CheckCircle size={18} color="#0F6E56" style={{ flexShrink: 0 }} />
                  <Box>
                    <Text fontSize="sm" fontWeight="medium" color="gray.800">{item.label}</Text>
                    <Text fontSize="xs" color="gray.500">{item.desc}</Text>
                  </Box>
                </Flex>
              ))}
            </Flex>
          </Flex>
          <Button
            onClick={handleNotifications}
            loading={notifLoading}
            loadingText="Setting up…"
            h={12}
            borderRadius="xl"
            fontWeight="semibold"
            colorPalette="brand"
          >
            Enable notifications
          </Button>
          <Button
            variant="plain"
            onClick={() => router.push('/dashboard')}
            fontSize="sm"
            color="gray.500"
            textDecoration="underline"
          >
            Skip for now
          </Button>
        </Flex>
      )}
    </Flex>
  );
}
