<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import Button from 'primevue/button'
import Select from 'primevue/select'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Dialog from 'primevue/dialog'
import Message from 'primevue/message'
import Textarea from 'primevue/textarea'
import InputText from 'primevue/inputtext'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import api from '@/services/api'
import { useToast } from 'primevue/usetoast'

const toast = useToast()

interface Enrollment {
  id: string
  childFirstName: string
  childLastName: string
  childDateOfBirth: string
  childGender: string
  programPreference: string
  schedulePreference: string
  preferredStartDate: string
  guardianFirstName: string
  guardianLastName: string
  guardianEmail: string
  guardianPhone: string
  guardianRelationship: string
  guardianAddress: string
  secondaryGuardianFirstName: string
  secondaryGuardianLastName: string
  secondaryGuardianPhone: string
  secondaryGuardianRelationship: string
  emergencyContactName: string
  emergencyContactPhone: string
  emergencyContactRelationship: string
  allergies: string
  medicalNotes: string
  specialNeeds: string
  immunizationStatus: string
  physicianName: string
  physicianPhone: string
  additionalNotes: string
  status: string
  source: string
  reviewNotes: string
  submittedAt: string
  reviewedAt: string
  createdAt: string
}

const loading = ref(false)
const enrollments = ref<Enrollment[]>([])
const statusFilter = ref<string | null>(null)
const searchQuery = ref('')
const showDetailDialog = ref(false)
const selectedEnrollment = ref<Enrollment | null>(null)
const reviewNotes = ref('')
const actionLoading = ref(false)
const error = ref('')

const statusOptions = [
  { label: 'All Statuses', value: null },
  { label: 'Submitted', value: 'submitted' },
  { label: 'Under Review', value: 'under_review' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'Waitlisted', value: 'waitlisted' },
]

const programLabels: Record<string, string> = {
  'infant': 'Infant Care',
  'toddler': 'Toddler',
  'early-preschool': 'Early Preschool',
  'preschool': 'Preschool',
  'pre-k': 'Pre-Kindergarten',
  'school-age': 'School Age',
}

const statusColors: Record<string, string> = {
  submitted: 'bg-blue-100 text-blue-800',
  under_review: 'bg-amber-100 text-amber-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  waitlisted: 'bg-purple-100 text-purple-800',
  pending: 'bg-gray-100 text-gray-800',
}

const sourceLabels: Record<string, string> = {
  website: 'Website',
  phone_agent: 'AI Phone',
  walk_in: 'Walk-in',
}

const filteredEnrollments = computed(() => {
  let result = enrollments.value
  if (statusFilter.value) {
    result = result.filter(e => e.status === statusFilter.value)
  }
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(e =>
      `${e.childFirstName} ${e.childLastName}`.toLowerCase().includes(q) ||
      `${e.guardianFirstName} ${e.guardianLastName}`.toLowerCase().includes(q) ||
      e.guardianEmail.toLowerCase().includes(q)
    )
  }
  return result
})

const enrollmentCounts = computed(() => {
  const counts: Record<string, number> = {}
  enrollments.value.forEach(e => {
    counts[e.status] = (counts[e.status] || 0) + 1
  })
  return counts
})

async function fetchEnrollments() {
  loading.value = true
  try {
    const response = await api.get('/api/enrollments')
    enrollments.value = response.data.data.enrollments || []
  } catch (err) {
    error.value = 'Failed to load enrollments'
  } finally {
    loading.value = false
  }
}

function viewEnrollment(enrollment: Enrollment) {
  selectedEnrollment.value = enrollment
  reviewNotes.value = enrollment.reviewNotes || ''
  showDetailDialog.value = true
}

async function updateStatus(enrollmentId: string, status: string) {
  actionLoading.value = true
  try {
    const endpoint = status === 'approved'
      ? `/api/enrollments/${enrollmentId}/approve`
      : status === 'rejected'
      ? `/api/enrollments/${enrollmentId}/reject`
      : `/api/enrollments/${enrollmentId}`

    const method = status === 'approved' || status === 'rejected' ? 'post' : 'patch'
    const body = status === 'approved' || status === 'rejected'
      ? { reviewNotes: reviewNotes.value }
      : { status, reviewNotes: reviewNotes.value }

    await api[method](endpoint, body)

    toast.add({
      severity: 'success',
      summary: 'Updated',
      detail: `Enrollment ${status}`,
      life: 3000,
    })

    showDetailDialog.value = false
    await fetchEnrollments()
  } catch (err) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to update enrollment',
      life: 3000,
    })
  } finally {
    actionLoading.value = false
  }
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

onMounted(() => {
  fetchEnrollments()
})
</script>

<template>
  <div class="p-6">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Enrollments</h1>
        <p class="text-sm text-gray-500">Manage enrollment submissions</p>
      </div>

      <!-- Quick Stats -->
      <div class="flex gap-3">
        <div class="bg-blue-50 rounded-lg px-4 py-2 text-center">
          <div class="text-lg font-bold text-blue-700">{{ enrollmentCounts['submitted'] || 0 }}</div>
          <div class="text-xs text-blue-500">New</div>
        </div>
        <div class="bg-amber-50 rounded-lg px-4 py-2 text-center">
          <div class="text-lg font-bold text-amber-700">{{ enrollmentCounts['under_review'] || 0 }}</div>
          <div class="text-xs text-amber-500">Reviewing</div>
        </div>
        <div class="bg-green-50 rounded-lg px-4 py-2 text-center">
          <div class="text-lg font-bold text-green-700">{{ enrollmentCounts['approved'] || 0 }}</div>
          <div class="text-xs text-green-500">Approved</div>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="flex flex-col sm:flex-row gap-3 mb-6">
      <IconField>
        <InputIcon class="pi pi-search" />
        <InputText v-model="searchQuery" placeholder="Search by name or email..." class="w-full sm:w-80" />
      </IconField>
      <Select
        v-model="statusFilter"
        :options="statusOptions"
        optionLabel="label"
        optionValue="value"
        placeholder="Filter by status"
        class="w-full sm:w-48"
      />
      <Button
        icon="pi pi-refresh"
        severity="secondary"
        outlined
        :loading="loading"
        @click="fetchEnrollments"
      />
    </div>

    <Message v-if="error" severity="error" class="mb-4">{{ error }}</Message>

    <!-- Table -->
    <DataTable
      :value="filteredEnrollments"
      :loading="loading"
      paginator
      :rows="20"
      stripedRows
      class="rounded-lg overflow-hidden"
      @row-click="(e: any) => viewEnrollment(e.data)"
      rowHover
      sortField="submittedAt"
      :sortOrder="-1"
    >
      <Column header="Child" sortable sortField="childFirstName">
        <template #body="{ data }">
          <div class="font-medium text-gray-900">{{ data.childFirstName }} {{ data.childLastName }}</div>
          <div class="text-xs text-gray-500">DOB: {{ formatDate(data.childDateOfBirth) }}</div>
        </template>
      </Column>

      <Column header="Guardian">
        <template #body="{ data }">
          <div class="text-sm text-gray-900">{{ data.guardianFirstName }} {{ data.guardianLastName }}</div>
          <div class="text-xs text-gray-500">{{ data.guardianPhone }}</div>
        </template>
      </Column>

      <Column header="Program" sortable sortField="programPreference">
        <template #body="{ data }">
          <span class="text-sm">{{ programLabels[data.programPreference] || data.programPreference }}</span>
        </template>
      </Column>

      <Column header="Source">
        <template #body="{ data }">
          <span class="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
            {{ sourceLabels[data.source] || data.source }}
          </span>
        </template>
      </Column>

      <Column header="Status" sortable sortField="status">
        <template #body="{ data }">
          <span
            :class="['text-xs font-medium px-2.5 py-1 rounded-full', statusColors[data.status] || 'bg-gray-100 text-gray-700']"
          >
            {{ data.status.replace('_', ' ') }}
          </span>
        </template>
      </Column>

      <Column header="Submitted" sortable sortField="submittedAt">
        <template #body="{ data }">
          <span class="text-sm text-gray-600">{{ formatDate(data.submittedAt) }}</span>
        </template>
      </Column>

      <Column header="" style="width: 80px">
        <template #body="{ data }">
          <Button
            icon="pi pi-eye"
            severity="secondary"
            text
            rounded
            size="small"
            @click.stop="viewEnrollment(data)"
          />
        </template>
      </Column>

      <template #empty>
        <div class="text-center py-12 text-gray-500">
          <i class="pi pi-inbox text-4xl mb-3 block text-gray-300"></i>
          <p>No enrollments found</p>
        </div>
      </template>
    </DataTable>

    <!-- Detail Dialog -->
    <Dialog
      v-model:visible="showDetailDialog"
      :header="`${selectedEnrollment?.childFirstName} ${selectedEnrollment?.childLastName}`"
      :style="{ width: '700px' }"
      :modal="true"
    >
      <div v-if="selectedEnrollment" class="space-y-5">
        <!-- Status Badge -->
        <div class="flex items-center justify-between">
          <span
            :class="['text-sm font-medium px-3 py-1.5 rounded-full', statusColors[selectedEnrollment.status]]"
          >
            {{ selectedEnrollment.status.replace('_', ' ') }}
          </span>
          <span class="text-sm text-gray-500">
            Submitted {{ formatDate(selectedEnrollment.submittedAt) }} via {{ sourceLabels[selectedEnrollment.source] || selectedEnrollment.source }}
          </span>
        </div>

        <!-- Child Info -->
        <div class="bg-gray-50 rounded-lg p-4">
          <h4 class="font-semibold text-gray-700 mb-2 text-sm">Child Information</h4>
          <div class="grid grid-cols-2 gap-2 text-sm">
            <div><span class="text-gray-500">Name:</span> {{ selectedEnrollment.childFirstName }} {{ selectedEnrollment.childLastName }}</div>
            <div><span class="text-gray-500">DOB:</span> {{ formatDate(selectedEnrollment.childDateOfBirth) }}</div>
            <div><span class="text-gray-500">Program:</span> {{ programLabels[selectedEnrollment.programPreference] || selectedEnrollment.programPreference }}</div>
            <div v-if="selectedEnrollment.schedulePreference"><span class="text-gray-500">Schedule:</span> {{ selectedEnrollment.schedulePreference.replace('_', ' ') }}</div>
            <div v-if="selectedEnrollment.preferredStartDate"><span class="text-gray-500">Start:</span> {{ formatDate(selectedEnrollment.preferredStartDate) }}</div>
            <div v-if="selectedEnrollment.childGender"><span class="text-gray-500">Gender:</span> {{ selectedEnrollment.childGender }}</div>
          </div>
        </div>

        <!-- Guardian Info -->
        <div class="bg-gray-50 rounded-lg p-4">
          <h4 class="font-semibold text-gray-700 mb-2 text-sm">Guardian</h4>
          <div class="grid grid-cols-2 gap-2 text-sm">
            <div><span class="text-gray-500">Name:</span> {{ selectedEnrollment.guardianFirstName }} {{ selectedEnrollment.guardianLastName }}</div>
            <div><span class="text-gray-500">Phone:</span> {{ selectedEnrollment.guardianPhone }}</div>
            <div><span class="text-gray-500">Email:</span> {{ selectedEnrollment.guardianEmail }}</div>
            <div v-if="selectedEnrollment.guardianRelationship"><span class="text-gray-500">Relationship:</span> {{ selectedEnrollment.guardianRelationship }}</div>
          </div>
          <div v-if="selectedEnrollment.guardianAddress" class="mt-2 text-sm">
            <span class="text-gray-500">Address:</span> {{ selectedEnrollment.guardianAddress }}
          </div>
          <div v-if="selectedEnrollment.secondaryGuardianFirstName" class="mt-3 pt-3 border-t border-gray-200 text-sm">
            <span class="text-gray-500">Secondary:</span> {{ selectedEnrollment.secondaryGuardianFirstName }} {{ selectedEnrollment.secondaryGuardianLastName }}
            <span v-if="selectedEnrollment.secondaryGuardianPhone"> — {{ selectedEnrollment.secondaryGuardianPhone }}</span>
          </div>
        </div>

        <!-- Medical Info -->
        <div class="bg-gray-50 rounded-lg p-4">
          <h4 class="font-semibold text-gray-700 mb-2 text-sm">Emergency & Medical</h4>
          <div class="space-y-1 text-sm">
            <div v-if="selectedEnrollment.emergencyContactName">
              <span class="text-gray-500">Emergency:</span> {{ selectedEnrollment.emergencyContactName }} ({{ selectedEnrollment.emergencyContactPhone }})
            </div>
            <div v-if="selectedEnrollment.allergies"><span class="text-gray-500">Allergies:</span> {{ selectedEnrollment.allergies }}</div>
            <div v-if="selectedEnrollment.medicalNotes"><span class="text-gray-500">Medical:</span> {{ selectedEnrollment.medicalNotes }}</div>
            <div v-if="selectedEnrollment.specialNeeds"><span class="text-gray-500">Special Needs:</span> {{ selectedEnrollment.specialNeeds }}</div>
            <div v-if="selectedEnrollment.immunizationStatus"><span class="text-gray-500">Immunizations:</span> {{ selectedEnrollment.immunizationStatus.replace('_', ' ') }}</div>
            <div v-if="selectedEnrollment.physicianName"><span class="text-gray-500">Physician:</span> {{ selectedEnrollment.physicianName }} ({{ selectedEnrollment.physicianPhone }})</div>
          </div>
        </div>

        <div v-if="selectedEnrollment.additionalNotes" class="bg-gray-50 rounded-lg p-4">
          <h4 class="font-semibold text-gray-700 mb-2 text-sm">Additional Notes</h4>
          <p class="text-sm text-gray-600">{{ selectedEnrollment.additionalNotes }}</p>
        </div>

        <!-- Review Section -->
        <div v-if="selectedEnrollment.status === 'submitted' || selectedEnrollment.status === 'under_review'" class="border-t border-gray-200 pt-4">
          <h4 class="font-semibold text-gray-700 mb-2 text-sm">Review Notes</h4>
          <Textarea v-model="reviewNotes" rows="2" placeholder="Add review notes (optional)" class="w-full mb-4" />
          <div class="flex gap-3">
            <Button
              label="Approve"
              icon="pi pi-check"
              class="!bg-green-600 !border-green-600 hover:!bg-green-700"
              :loading="actionLoading"
              @click="updateStatus(selectedEnrollment!.id, 'approved')"
            />
            <Button
              label="Waitlist"
              icon="pi pi-clock"
              severity="warn"
              :loading="actionLoading"
              @click="updateStatus(selectedEnrollment!.id, 'waitlisted')"
            />
            <Button
              label="Reject"
              icon="pi pi-times"
              severity="danger"
              :loading="actionLoading"
              @click="updateStatus(selectedEnrollment!.id, 'rejected')"
            />
          </div>
        </div>

        <!-- Already Reviewed -->
        <div v-else-if="selectedEnrollment.reviewedAt" class="border-t border-gray-200 pt-4 text-sm text-gray-500">
          Reviewed on {{ formatDate(selectedEnrollment.reviewedAt) }}
          <span v-if="selectedEnrollment.reviewNotes"> — {{ selectedEnrollment.reviewNotes }}</span>
        </div>
      </div>
    </Dialog>
  </div>
</template>
