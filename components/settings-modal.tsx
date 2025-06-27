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
import { Settings, Plus, Trash2, Edit, Check, X } from "lucide-react";
import { useState } from "react";

export function SettingsModal() {
  const { aliases, addAlias, removeAlias, editAlias } = useAliasStore();

  const [newIntegration, setNewIntegration] = useState<string>("");
  const [newName, setNewName] = useState<string>("");
  const [newValue, setNewValue] = useState<string>("");
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editName, setEditName] = useState<string>("");
  const [editValue, setEditValue] = useState<string>("");

  const handleAddAlias = () => {
    if (!newIntegration.trim() || !newName.trim() || !newValue.trim()) return;
    addAlias(newIntegration, { name: newName, value: newValue });
    setNewIntegration("");
    setNewName("");
    setNewValue("");
  };

  const handleEditStart = (
    integration: string,
    alias: { name: string; value: string },
  ) => {
    const editKey = `${integration}:${alias.name}`;
    setEditingKey(editKey);
    setEditName(alias.name);
    setEditValue(alias.value);
  };

  const handleEditSave = (integration: string, oldName: string) => {
    if (!editName.trim() || !editValue.trim()) return;
    editAlias(integration, oldName, { name: editName, value: editValue });
    setEditingKey(null);
    setEditName("");
    setEditValue("");
  };

  const handleEditCancel = () => {
    setEditingKey(null);
    setEditName("");
    setEditValue("");
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
                    {aliasList.map((alias) => {
                      const editKey = `${integration}:${alias.name}`;
                      const isEditing = editingKey === editKey;

                      return (
                        <div
                          key={alias.name}
                          className="flex items-center gap-3 p-3 border rounded-lg bg-muted/30"
                        >
                          <div className="flex-1 grid grid-cols-2 gap-3">
                            <div>
                              <Label className="text-xs text-muted-foreground">
                                Alias Name
                              </Label>
                              {isEditing ? (
                                <Input
                                  value={editName}
                                  onChange={(e) => setEditName(e.target.value)}
                                  className="font-mono text-sm mt-1 h-8"
                                />
                              ) : (
                                <div className="font-mono text-sm mt-1">
                                  {alias.name}
                                </div>
                              )}
                            </div>
                            <div>
                              <Label className="text-xs text-muted-foreground">
                                Value
                              </Label>
                              {isEditing ? (
                                <Input
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  className="font-mono text-sm mt-1 h-8"
                                />
                              ) : (
                                <div
                                  className="font-mono text-sm mt-1 truncate"
                                  title={alias.value}
                                >
                                  {alias.value}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-1">
                            {isEditing ? (
                              <>
                                <Button
                                  variant="default"
                                  size="icon"
                                  className="size-8"
                                  onClick={() =>
                                    handleEditSave(integration, alias.name)
                                  }
                                  disabled={
                                    !editName.trim() || !editValue.trim()
                                  }
                                >
                                  <Check className="size-3" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="size-8"
                                  onClick={handleEditCancel}
                                >
                                  <X className="size-3" />
                                </Button>
                              </>
                            ) : (
                              <>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="size-8"
                                  onClick={() =>
                                    handleEditStart(integration, alias)
                                  }
                                >
                                  <Edit className="size-3" />
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="icon"
                                  className="size-8"
                                  onClick={() =>
                                    removeAlias(integration, alias.name)
                                  }
                                >
                                  <Trash2 className="size-3" />
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeIntegrations.length > 0 && <Separator />}

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
