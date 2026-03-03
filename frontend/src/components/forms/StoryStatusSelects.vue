<template>
  <div class="story-status-selects">
    <div class="form-group">
      <label class="form-label"><i class="fas fa-check-circle icon"></i> Trạng thái truyện</label>
      <CustomSelect
        :modelValue="modelValue.trang_thai"
        @update:modelValue="updateField('trang_thai', $event)"
        :options="statusOptions"
        :is-invalid="submitted && !modelValue.trang_thai"
        placeholder="-- Chọn trạng thái --"
      />
      <span v-if="submitted && !modelValue.trang_thai" class="error-message-inline">Vui lòng chọn trạng thái.</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import CustomSelect from '@/components/common/CustomSelect.vue';

interface SelectOption {
  value: string | number;
  label: string;
}

interface StoryStatusFields {
  trang_thai: string;
}

const props = defineProps<{
  modelValue: StoryStatusFields;
  submitted: boolean; 
}>();

const emit = defineEmits(['update:modelValue']);

const statusOptions: SelectOption[] = [
  { value: 'dang_ra', label: 'Đang ra' },
  { value: 'hoan_thanh', label: 'Hoàn thành' },
];

const updateField = (field: keyof StoryStatusFields, value: string) => {
  emit('update:modelValue', { ...props.modelValue, [field]: value });
};
</script>

<style scoped>
.form-group {
  margin-bottom: 0.5rem; 
  display: flex;
  flex-direction: column;
  gap: 0.75rem; 
}

.form-label {
  font-size: 1.1rem;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 0.5rem;
  position: relative;
  transition: color 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.form-label .icon {
  color: #22c55e; 
  font-size: 1.2em;
}

.error-message-inline {
  color: #ef4444;
  font-size: 0.9rem;
  margin-top: 0.5rem;
  font-weight: 500;
  display: block;
}

@media (max-width: 768px) {
  .form-label {
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .form-group { gap: 0.5rem; }
  .form-label { font-size: 0.95rem; gap: 0.3rem; }
  .form-label .icon { font-size: 1em; }
  .error-message-inline { font-size: 0.75rem; margin-top: 0.1rem; }
}
</style>