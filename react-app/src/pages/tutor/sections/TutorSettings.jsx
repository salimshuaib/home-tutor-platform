import { Trash2 } from 'lucide-react';

export default function TutorSettings() {
  return (
    <>
      <div className="page-header"><h1 className="page-title"><em>Settings</em></h1></div>
      <div className="card">
        <div className="card-header"><h3 className="card-title">Account</h3></div>
        <div className="form-grid">
          <div className="form-group full">
            <label className="form-label">Email Notifications</label>
            <div className="check-group">
              <label className="check-pill selected"><input type="checkbox" hidden defaultChecked />New Lead Alerts</label>
              <label className="check-pill selected"><input type="checkbox" hidden defaultChecked />Profile Views</label>
              <label className="check-pill"><input type="checkbox" hidden />Marketing</label>
            </div>
          </div>
          <div className="form-group full" style={{ marginTop: '1rem' }}>
            <label className="form-label">Danger Zone</label>
            <button className="btn btn-danger btn-sm" onClick={() => alert('Please contact support to delete your account.')}><Trash2 size={14} /> Delete Account</button>
          </div>
        </div>
      </div>
    </>
  );
}
