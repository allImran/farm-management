<!-- Shell for signed-in pages. The payment modal lives here so any write action can open it. -->
<template>
  <AppShell>
    <SubscriptionBanner class="mb-6" />
    <slot />
    <PaymentRequestModal />
  </AppShell>
</template>
