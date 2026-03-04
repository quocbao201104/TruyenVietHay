<template>
  <div class="custom-select" ref="selectRef">
    <div
      class="select-selected"
      :class="{ open: isOpen, 'is-invalid': isInvalid }"
      @click="toggleDropdown"
    >
      <input
        v-if="searchable"
        type="text"
        v-model="searchTerm"
        :placeholder="isOpen ? 'Tìm kiếm...' : selectedLabel"
        class="select-search-input"
        @focus="openDropdown"
        @input="filterOptions"
        @keydown.stop
      />
      <span v-else>{{ selectedLabel }}</span>
      <i class="fas fa-chevron-down select-arrow" :class="{ 'rotate': isOpen }"></i>
    </div>
    <div class="select-items" v-show="isOpen">
      <div v-if="filteredOptions.length === 0" class="no-results">
        Không tìm thấy kết quả nào.
      </div>
      <div
        v-for="(option, i) in filteredOptions"
        :key="option.value ?? `null-${i}`"
        @click="selectOption(option)"
        class="select-item"
        :class="{ 'same-as-selected': option.value === modelValue }"
      >
        {{ option.label }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch, PropType } from 'vue';

interface SelectOption {
  value: string | number | null;
  label: string;
}

const props = defineProps({
  options: {
    type: Array as () => SelectOption[],
    required: true,
  },
  modelValue: {
    type: [String, Number, null] as PropType<string | number | null>,
    required: false,
    default: null,
  },
  placeholder: {
    type: String,
    default: '-- Chọn --',
  },
  isInvalid: {
    type: Boolean,
    default: false,
  },
  searchable: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['update:modelValue']);

const isOpen = ref(false);
const selectRef = ref<HTMLElement | null>(null);
const searchTerm = ref('');
const filteredOptions = ref<SelectOption[]>(props.options);

const selectedLabel = computed(() => {
  const selected = props.options.find(opt => opt.value === props.modelValue);
  return selected ? selected.label : props.placeholder;
});

const toggleDropdown = () => {
  isOpen.value = !isOpen.value;
  if (isOpen.value && props.searchable) {
    searchTerm.value = ''; 
    filterOptions();
  }
};

const openDropdown = () => {
  isOpen.value = true;
  if (props.searchable) {
    searchTerm.value = '';
    filterOptions();
  }
};

const selectOption = (option: SelectOption) => {
  emit('update:modelValue', option.value);
  isOpen.value = false;
  searchTerm.value = option.label; 
};

const filterOptions = () => {
  if (!props.searchable || !searchTerm.value) {
    filteredOptions.value = props.options;
  } else {
    const lowerCaseSearchTerm = searchTerm.value.toLowerCase();
    filteredOptions.value = props.options.filter(option =>
      option.label.toLowerCase().includes(lowerCaseSearchTerm)
    );
  }
};

const closeOnOutsideClick = (e: MouseEvent) => {
  if (selectRef.value && !selectRef.value.contains(e.target as Node)) {
    isOpen.value = false;
  }
};

watch(() => props.options, (newOptions) => {
  filteredOptions.value = newOptions;
}, { deep: true });

onMounted(() => {
  document.addEventListener('click', closeOnOutsideClick);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', closeOnOutsideClick);
});
</script>

<style scoped>
.custom-select {
  position: relative;
  width: 100%;
  font-family: 'Be Vietnam Pro', sans-serif;
  color: #ffffff;
}

.select-selected {
  padding: 0.75rem 1rem;
  border-radius: 0.5rem; 
  border: 1px solid rgba(76, 175, 80, 0.3);
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.3s ease;
  font-size: 1rem;
  background-color: rgba(36, 40, 52, 0.7); /* Màu nền khớp với filter section */
}

.select-selected.open,
.select-selected:hover {
  border-color: #4caf50;
  background: rgba(76, 175, 80, 0.1);
  box-shadow: 0 0 10px rgba(76, 175, 80, 0.3); 
}

.select-selected.is-invalid {
  border-color: #ef4444 !important;
  box-shadow: 0 0 8px rgba(239, 68, 68, 0.5);
}

.select-arrow {
  transition: transform 0.3s ease;
  color: #4caf50;
  margin-left: 0.5rem; /* Khoảng cách với text/input */
}

.select-arrow.rotate {
  transform: rotate(180deg);
}

.select-search-input {
  flex-grow: 1;
  border: none;
  background: transparent;
  color: #ffffff;
  font-size: 1rem;
  padding: 0;
  margin: 0;
  outline: none;
}

.select-search-input::placeholder {
  color: rgba(255, 255, 255, 0.6);
}

.select-items {
  position: absolute;
  background-color: #2a2d3a; 
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  z-index: 99;
  border-radius: 0.5rem;
  border: 1px solid #4caf50; 
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5);
  max-height: 250px; /* Giới hạn chiều cao */
  overflow-y: auto; /* Thêm thanh cuộn dọc */
  scrollbar-width: thin; 
  scrollbar-color: #4ade80 #2d313d; 
}

.select-items::-webkit-scrollbar {
  width: 8px;
}

.select-items::-webkit-scrollbar-track {
  background: #2d313d;
  border-radius: 10px;
}

.select-items::-webkit-scrollbar-thumb {
  background-color: #4ade80;
  border-radius: 10px;
  border: 2px solid #2d313d;
}

.select-item {
  padding: 0.75rem 1rem; 
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease;
  color: #e5e7eb;
  font-size: 1rem;
}

.select-item:hover, .select-item.same-as-selected {
  background-color: #4caf50; 
  color: #1a1d29; 
}

.no-results {
  padding: 0.75rem 1rem;
  color: rgba(255, 255, 255, 0.6);
  text-align: center;
  font-style: italic;
}
</style>