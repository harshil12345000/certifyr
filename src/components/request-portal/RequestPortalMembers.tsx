import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Trash2, Users } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface PortalEmployee {
  id: string;
  full_name: string;
  email: string;
  employee_id: string;
  phone_number: string | null;
  manager_name: string | null;
  status: "pending" | "approved" | "rejected";
  registered_at: string;
}

export function RequestPortalMembers({
  organizationId,
  maxMembers,
  onMemberProcessed,
}: {
  organizationId: string;
  maxMembers?: number | null;
  onMemberProcessed?: () => void;
}) {
  const { user } = useAuth();
  const [employees, setEmployees] = useState<PortalEmployee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (organizationId) {
      fetchEmployees();
    }
  }, [organizationId]);

  const fetchEmployees = async () => {
    if (!organizationId) {
      setLoading(false);
      return;
    }

    try {

      // Get portal employees
      const { data: employeesData, error } = await supabase
        .from("request_portal_employees")
        .select("*")
        .eq("organization_id", organizationId)
        .order("registered_at", { ascending: false });

      if (error) throw error;

      setEmployees(employeesData || []);
    } catch (error) {
      console.error("Error fetching employees:", error);
      toast({
        title: "Error",
        description: "Failed to load portal members",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateEmployeeStatus = async (
    employeeId: string,
    status: "approved" | "rejected",
  ) => {
    try {
      const { error } = await supabase
        .from("request_portal_employees")
        .update({
          status,
          approved_at: status === "approved" ? new Date().toISOString() : null,
          approved_by: status === "approved" ? user?.id : null,
        })
        .eq("id", employeeId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Employee ${status} successfully`,
      });

      fetchEmployees();
      onMemberProcessed?.();
    } catch (error) {
      console.error("Error updating employee status:", error);
      toast({
        title: "Error",
        description: `Failed to ${status} employee`,
        variant: "destructive",
      });
    }
  };

  const removeEmployee = async (employeeId: string) => {
    try {
      const { error } = await supabase
        .from("request_portal_employees")
        .delete()
        .eq("id", employeeId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Employee removed successfully",
      });

      fetchEmployees();
      onMemberProcessed?.();
    } catch (error) {
      console.error("Error removing employee:", error);
      toast({
        title: "Error",
        description: "Failed to remove employee",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "approved":
        return (
          <Badge variant="default" className="bg-green-600">
            Approved
          </Badge>
        );
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Portal Members</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Check if at member limit (for Pro plan)
  const isAtLimit = maxMembers !== null && maxMembers !== undefined && employees.length >= maxMembers;
  const approvedCount = employees.filter(e => e.status === "approved").length;
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Portal Members</CardTitle>
            <CardDescription>
              Manage employees who have access to the request portal
            </CardDescription>
          </div>
          {maxMembers !== null && maxMembers !== undefined && (
            <div className={`text-sm font-medium px-3 py-1.5 rounded-md ${isAtLimit ? 'bg-destructive/10 text-destructive' : 'bg-muted'}`}>
              {approvedCount} / {maxMembers} approved
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {employees.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">No portal members yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {employees.map((employee) => (
              <div
                key={employee.id}
                className="border rounded-lg p-4 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h3 className="font-medium">{employee.full_name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {employee.email} • Employee ID: {employee.employee_id}
                    </p>
                    {employee.phone_number && (
                      <p className="text-sm text-muted-foreground">
                        Phone: {employee.phone_number}
                      </p>
                    )}
                    {employee.manager_name && (
                      <p className="text-sm text-muted-foreground">
                        Manager: {employee.manager_name}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Registered{" "}
                      {formatDistanceToNow(new Date(employee.registered_at), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                  {getStatusBadge(employee.status)}
                </div>

                <div className="flex gap-2">
                  {employee.status === "pending" && (
                    <>
                      <Button
                        size="sm"
                        onClick={() =>
                          updateEmployeeStatus(employee.id, "approved")
                        }
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() =>
                          updateEmployeeStatus(employee.id, "rejected")
                        }
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    </>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => removeEmployee(employee.id)}
                    className="hover:bg-destructive hover:text-destructive-foreground hover:border-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
