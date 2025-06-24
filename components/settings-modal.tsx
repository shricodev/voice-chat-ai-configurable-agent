"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAliasStore } from "@/lib/alias-store";
import { Settings, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

export function SettingsModal() {
  const { aliases, addAlias, removeAlias } = useAliasStore();
  const [newIntegration, setNewIntegration] = useState("");
  const [newName, setNewName] = useState("");
  const [newValue, setNewValue] = useState("");

  const handleAddAlias = () => {
    if (!newIntegration.trim() || !newName.trim() || !newValue.trim()) return;
    addAlias(newIntegration, { name: newName, value: newValue });
    setNewIntegration("");
    setNewName("");
    setNewValue("");
  };

  const activeIntegrations = Object.entries(aliases).filter(
    ([, aliasList]) => aliasList && aliasList.length > 0,
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2" variant="outline">
          <Settings className="size-4" />
          Add Params
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[650px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Integration Parameters</DialogTitle>
          <DialogDescription>
            Manage your integration parameters and aliases. Add new parameters
            or remove existing ones.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Only show if there are active integrations */}
          {activeIntegrations.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Current Parameters
              </h3>
              {activeIntegrations.map(([integration, aliasList]) => (
                <div key={integration} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="size-2 rounded-full bg-blue-500" />
                    <h4 className="font-medium capitalize">{integration}</h4>
                  </div>
                  <div className="space-y-2 pl-4">
                    {aliasList.map((alias) => (
                      <div
                        key={alias.name}
                        className="flex items-center gap-3 p-3 border rounded-lg bg-muted/30"
                      >
                        <div className="flex-1 grid grid-cols-2 gap-3">
                          <div>
                            <Label className="text-xs text-muted-foreground">
                              Alias Name
                            </Label>
                            <div className="font-mono text-sm mt-1">
                              {alias.name}
                            </div>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">
                              Value
                            </Label>
                            <div
                              className="font-mono text-sm mt-1 truncate"
                              title={alias.value}
                            >
                              {alias.value}
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="destructive"
                          size="icon"
                          className="size-8"
                          onClick={() => removeAlias(integration, alias.name)}
                        >
                          <Trash2 className="size-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeIntegrations.length > 0 && <Separator />}

          {/* Add New Parameter Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Add New Parameter
            </h3>
            <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
              <div className="space-y-2">
                <Label htmlFor="integration">Integration Type</Label>
                <Input
                  id="integration"
                  placeholder="e.g., discord, slack, github"
                  value={newIntegration}
                  onChange={(e) => setNewIntegration(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="alias-name">Alias Name</Label>
                  <Input
                    id="alias-name"
                    placeholder="e.g., myTeamChannel"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="alias-value">Value</Label>
                  <Input
                    id="alias-value"
                    placeholder="ID, URL, or other value"
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                  />
                </div>
              </div>
              <Button
                onClick={handleAddAlias}
                className="w-full"
                disabled={
                  !newIntegration.trim() || !newName.trim() || !newValue.trim()
                }
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Parameter
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
