import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface Template {
  id: string;
  title: string;
  description: string;
  fields: any[];
  created_at: string;
}

export default function TemplatesDashboard() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('templates')
      .select('id, title, description, fields, created_at')
      .order('created_at', { ascending: false });
    if (!error && data) setTemplates(data);
    setLoading(false);
  };

  const handleCreate = () => {
    navigate('/admin/templates/builder');
  };

  const handleEdit = (tpl: Template) => {
    navigate(`/admin/templates/builder?id=${tpl.id}`);
  };

  const handleDelete = async (tpl: Template) => {
    if (!window.confirm('Delete this template?')) return;
    await supabase.from('templates').delete().eq('id', tpl.id);
    fetchTemplates();
  };

  // Pseudo-auth: Only show if user is admin (replace with real auth check)
  const isAdmin = true;
  if (!isAdmin) return <div>Access denied</div>;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Templates</h1>
        <Button onClick={handleCreate}>Create Template</Button>
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">Title</th>
              <th className="py-2 px-4 border-b">Description</th>
              <th className="py-2 px-4 border-b">Created At</th>
              <th className="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {templates.map((tpl) => (
              <tr key={tpl.id}>
                <td className="py-2 px-4 border-b">{tpl.title}</td>
                <td className="py-2 px-4 border-b">{tpl.description}</td>
                <td className="py-2 px-4 border-b">{new Date(tpl.created_at).toLocaleString()}</td>
                <td className="py-2 px-4 border-b">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(tpl)}>Edit</Button>
                  <Button size="sm" variant="destructive" className="ml-2" onClick={() => handleDelete(tpl)}>Delete</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
} 