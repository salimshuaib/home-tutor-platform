import sys

def fix_admin_js():
    with open('admin/admin.js', 'r', encoding='utf-8') as f:
        content = f.read()

    # Change classList.add('open')/remove('open') to 'show' on the overlays
    content = content.replace(".classList.add('open')", ".classList.add('show')")
    content = content.replace(".classList.remove('open')", ".classList.remove('show')")
    
    # Update IDs to -overlay versions where we call classList.add('show')
    content = content.replace("document.getElementById('image-viewer-modal')", "document.getElementById('image-viewer-overlay')")
    content = content.replace("document.getElementById('doc-viewer-modal')", "document.getElementById('doc-viewer-overlay')")
    content = content.replace("document.getElementById('admin-profile-modal')", "document.getElementById('admin-profile-overlay')")
    
    with open('admin/admin.js', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Fixed admin.js logic")

fix_admin_js()
