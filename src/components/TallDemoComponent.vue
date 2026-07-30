<template>
  <section class="tall-demo-block">
    <header>
      <span class="eyebrow">Generated plan</span>
      <strong>{{ block.title }}</strong>
    </header>
    <ol>
      <li v-for="(item, index) in block.items" :key="item">
        <span>{{ index + 1 }}</span>
        {{ item }}
      </li>
    </ol>
  </section>
</template>

<script setup lang="ts">
interface TallDemoBlock {
  title: string;
  items: string[];
}

defineProps<{ block: TallDemoBlock }>();
</script>

<style scoped>
.tall-demo-block {
  margin: 0.8rem 0;
  padding: 20px;
  color: #292925;
  background: #f7f7f3;
  border: 1px solid #deded6;
  border-radius: 12px;
}

header {
  display: grid;
  gap: 4px;
  margin-bottom: 16px;
}

.eyebrow {
  color: #77776e;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

strong {
  font-size: 16px;
}

ol {
  display: grid;
  gap: 9px;
  margin: 0;
  padding: 0;
  list-style: none;
}

li {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 32px;
  padding: 7px 10px;
  font-size: 13px;
  background: #fff;
  border: 1px solid #e4e4dc;
  border-radius: 7px;
}

li span {
  display: grid;
  flex: 0 0 22px;
  height: 22px;
  place-items: center;
  color: #fff;
  background: #343430;
  border-radius: 50%;
  font-size: 11px;
  font-weight: 650;
}
</style>
