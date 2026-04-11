import sys

def fix_admin_dashboard():
    filename = 'admin/admin-dashboard.html'
    try:
        with open(filename, 'r', encoding='utf-8') as f:
            content = f.read()

        # Clean out the previously injected (and slightly broken) modal HTML
        # Look for the start comment I used
        marker = '<!-- ━━━ ADMIN PROFILE MODAL ━━━ -->'
        if marker in content:
            parts = content.split(marker)
            content = parts[0]
            # We assume everything from the marker onwards was the old modal injection if it was at the bottom
            # Actually, let's just find the closing body tag and inject fresh ones before it.
        
        # Ensure we have a clean slate from </body> to avoid duplicates
        body_end = '</body>'
        if body_end in content:
            content = content.split(body_end)[0]
        
        new_modals = \"\"\"
<!-- ━━━ ADMIN PROFILE MODAL ━━━ -->
<div class=\"modal-overlay\" id=\"admin-profile-overlay\">
  <div class=\"modal\" style=\"max-width: 700px;\">
    <div class=\"modal-header\">
      <h2 class=\"modal-title\">Tutor Profile Details</h2>
      <button class=\"modal-close\" onclick=\"document.getElementById('admin-profile-overlay').classList.remove('show')\"><i data-lucide=\"x\"></i></button>
    </div>
    <div class=\"modal-body\" id=\"admin-profile-content\" style=\"max-height: 70vh; overflow-y: auto; padding-right: 10px; text-align: left;\">
      <!-- Injected by JS -->
    </div>
    <div class=\"modal-actions\" id=\"admin-profile-actions\">
      <!-- Injected by JS -->
    </div>
  </div>
</div>

<!-- ━━━ IMAGE VIEWER MODAL ━━━ -->
<div class=\"modal-overlay\" id=\"image-viewer-overlay\" style=\"z-index: 1000;\">
  <div class=\"modal\" style=\"max-width: 90vw; background: transparent; box-shadow: none; padding: 0;\">
    <button class=\"modal-close\" onclick=\"document.getElementById('image-viewer-overlay').classList.remove('show')\" style=\"position: absolute; top: -40px; right: 0; color: white; background: rgba(0,0,0,0.5); width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center;\"><i data-lucide=\"x\"></i></button>
    <div style=\"text-align: center;\">
      <img id=\"image-viewer-img\" src=\"\" style=\"max-width: 100%; max-height: 85vh; object-fit: contain; border-radius: 8px; box-shadow: 0 20px 50px rgba(0,0,0,0.5);\">
    </div>
  </div>
</div>

<!-- ━━━ DOCUMENT VIEWER MODAL ━━━ -->
<div class=\"modal-overlay\" id=\"doc-viewer-overlay\" style=\"z-index: 1000;\">
  <div class=\"modal\" style=\"max-width: 1100px; width: 95vw; height: 90vh; padding: 0; display: flex; flex-direction: column; overflow: hidden;\">
    <div style=\"display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.5rem; border-bottom: 1px solid rgba(0,0,0,0.05); background: #f8f9fa;\">
      <h2 style=\"margin: 0; font-size: 1.1rem; color: var(--navy);\">Verification Document</h2>
      <div style=\"display: flex; gap: 12px; align-items: center;\">
        <a id=\"doc-viewer-download\" href=\"#\" target=\"_blank\" class=\"btn btn-outline btn-sm\"><i data-lucide=\"external-link\"></i> Open Original</a>
        <button class=\"modal-close\" onclick=\"document.getElementById('doc-viewer-overlay').classList.remove('show')\" style=\"color: var(--text-light);\"><i data-lucide=\"x\"></i></button>
      </div>
    </div>
    <div style=\"flex: 1; position: relative; background: #525659;\">
      <iframe id=\"doc-viewer-iframe\" style=\"width: 100%; height: 100%; border: none;\"></iframe>
    </div>
  </div>
</div>

</body>
</html>
\"\"\"
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(content + new_modals)
        print(\"Fixed admin-dashboard.html modals\")
    except Exception as e:
        print(f\"Error: {e}\")

fix_admin_dashboard()
