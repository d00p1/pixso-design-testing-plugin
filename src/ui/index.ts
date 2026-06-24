import './styles.css';

let selectedNode: {
  id: string;
  name: string;
  type: string;
  width: number;
  height: number;
  pageName: string;
} | null = null;

let currentDesignId = '';

const $selInfo = document.getElementById('selection-info')!;
const $exportBtn = document.getElementById('export-btn') as HTMLButtonElement;
const $historyBtn = document.getElementById('history-btn') as HTMLButtonElement;
const $exportDialog = document.getElementById('export-dialog')!;
const $historyDialog = document.getElementById('history-dialog')!;
const $toast = document.getElementById('toast')!;
const $fieldDesignId = document.getElementById('field-design-id') as HTMLInputElement;
const $fieldComment = document.getElementById('field-comment') as HTMLInputElement;
const $fieldScale = document.getElementById('field-scale') as HTMLSelectElement;
const $fieldFormat = document.getElementById('field-format') as HTMLSelectElement;
const $svgOptionsGroup = document.getElementById('svg-options-group')!;
const $fieldSvgOutlineText = document.getElementById('field-svg-outline-text') as HTMLInputElement;
const $fieldSvgIdAttribute = document.getElementById('field-svg-id-attribute') as HTMLInputElement;
const $fieldDesignProperties = document.getElementById('field-design-properties') as HTMLInputElement;
const $fieldTags = document.getElementById('field-tags') as HTMLInputElement;
const $fieldTestId = document.getElementById('field-test-id') as HTMLInputElement;
const $confirmExportBtn = document.getElementById('confirm-export-btn')!;
const $cancelExportBtn = document.getElementById('cancel-export-btn')!;
const $closeHistoryBtn = document.getElementById('close-history-btn')!;
const $historyContent = document.getElementById('history-content')!;

$fieldFormat.addEventListener('change', () => {
  $svgOptionsGroup.style.display =
    $fieldFormat.value === 'PNG+SVG' ? '' : 'none';
});

window.addEventListener('message', (event) => {
  const msg = event.data.pluginMessage || event.data;
  switch (msg.type) {
    case 'selection-update':
      handleSelectionUpdate(msg.payload);
      break;
    case 'export-started':
      showToast('Exporting...');
      break;
    case 'export-complete':
      handleExportComplete(msg.payload);
      break;
    case 'export-error':
      showToast(msg.payload, 'error');
      break;
    case 'versions-response':
      handleVersionsResponse(msg.payload);
      break;
    case 'mapping-saved':
      showToast('Mapping saved');
      break;
  }
});

function handleSelectionUpdate(node: typeof selectedNode) {
  selectedNode = node;
  if (node) {
    currentDesignId = slugify(node.name);
    $selInfo.innerHTML = `
      <div class="info-row"><span class="info-label">Name</span><span class="info-value">${esc(node.name)}</span></div>
      <div class="info-row"><span class="info-label">Type</span><span class="info-value">${esc(node.type)}</span></div>
      <div class="info-row"><span class="info-label">Width</span><span class="info-value">${node.width}</span></div>
      <div class="info-row"><span class="info-label">Height</span><span class="info-value">${node.height}</span></div>
      <div class="info-row"><span class="info-label">Page</span><span class="info-value">${esc(node.pageName)}</span></div>
      <div class="info-row"><span class="info-label">Design ID</span><span class="info-value">${esc(currentDesignId)}</span></div>
    `;
    $exportBtn.disabled = false;
    $historyBtn.style.display = '';
  } else {
    $selInfo.innerHTML = '<div class="no-selection">Select a Frame or Component in Pixso</div>';
    $exportBtn.disabled = true;
    $historyBtn.style.display = 'none';
  }
}

function handleExportComplete(payload: { artifact: { version: number; designId: string }; zipBase64: string; zipName: string }) {
  showToast(`v${payload.artifact.version} exported — downloading…`);
  $exportDialog.classList.remove('open');

  const binary = atob(payload.zipBase64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  const blob = new Blob([bytes], { type: 'application/zip' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = payload.zipName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function handleVersionsResponse(versions: Array<{ version: number; createdAt: string; comment?: string }>) {
  if (versions.length === 0) {
    $historyContent.innerHTML = '<div class="no-selection">No versions yet</div>';
    return;
  }
  $historyContent.innerHTML = versions
    .map(
      (v) => `
    <div class="version-item">
      <span>v${v.version}</span>
      <span style="color:#888">${new Date(v.createdAt).toLocaleDateString()}</span>
      ${v.comment ? `<span style="color:#666;font-size:10px">${esc(v.comment)}</span>` : ''}
    </div>`,
    )
    .join('');
}

function showToast(message: string, type?: string) {
  $toast.textContent = message;
  $toast.className = 'toast ' + (type === 'error' ? 'toast-error' : 'toast-success') + ' show';
  setTimeout(() => {
    $toast.classList.remove('show');
  }, 3000);
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function esc(text: string): string {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

$exportBtn.addEventListener('click', () => {
  $fieldDesignId.value = currentDesignId;
  $exportDialog.classList.add('open');
  $svgOptionsGroup.style.display =
    $fieldFormat.value === 'PNG+SVG' ? '' : 'none';
});

$cancelExportBtn.addEventListener('click', () => {
  $exportDialog.classList.remove('open');
});

$confirmExportBtn.addEventListener('click', () => {
  if (!selectedNode) return;
  const designId = $fieldDesignId.value.trim();
  if (!designId) {
    showToast('Design ID is required', 'error');
    return;
  }

  const tagsStr = $fieldTags.value.trim();
  const tags = tagsStr ? tagsStr.split(',').map((t) => t.trim()).filter(Boolean) : [];

  const includeSvg = $fieldFormat.value === 'PNG+SVG';

  parent.postMessage(
    {
      pluginMessage: {
        type: 'export',
        payload: {
          nodeId: selectedNode.id,
          designId,
          scale: parseInt($fieldScale.value),
          comment: $fieldComment.value.trim() || undefined,
          tags: tags.length > 0 ? tags : undefined,
          testId: $fieldTestId.value.trim() || undefined,
          includeSvg,
          svgOutlineText: includeSvg ? $fieldSvgOutlineText.checked : undefined,
          svgIdAttribute: includeSvg ? $fieldSvgIdAttribute.checked : undefined,
          includeDesignProperties: $fieldDesignProperties.checked,
        },
      },
    },
    '*',
  );
});

$historyBtn.addEventListener('click', () => {
  if (!currentDesignId) return;
  $historyDialog.classList.add('open');
  parent.postMessage(
    {
      pluginMessage: {
        type: 'get-versions',
        payload: { designId: currentDesignId },
      },
    },
    '*',
  );
});

$closeHistoryBtn.addEventListener('click', () => {
  $historyDialog.classList.remove('open');
});

parent.postMessage({ pluginMessage: { type: 'get-selection' } }, '*');
