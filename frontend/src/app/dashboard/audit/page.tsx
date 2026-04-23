"use client";

import { useEffect, useState } from "react";
import {
  Button,
  Card,
  Dropdown,
  Paginator,
  Tag,
  Typography,
} from "@uigovpe/components";
import api from "@/lib/api";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface AuditLog {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  performedBy: string;
  createdAt: string;
  user: { id: string; name: string; email: string };
}

interface PaginatedAudit {
  data: AuditLog[];
  total: number;
  page: number;
  limit: number;
}

const ACTION_COLORS: Record<string, string> = {
  CREATE: "success",
  UPDATE: "warning",
  DELETE: "danger",
};

const entityOptions = [
  { label: "Todas as entidades", value: "" },
  { label: "Usuário", value: "User" },
  { label: "Produto", value: "Product" },
  { label: "Categoria", value: "Category" },
];

const actionOptions = [
  { label: "Todas as ações", value: "" },
  { label: "Criação", value: "CREATE" },
  { label: "Atualização", value: "UPDATE" },
  { label: "Exclusão", value: "DELETE" },
];

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [entity, setEntity] = useState("");
  const [action, setAction] = useState("");
  const limit = 20;

  async function loadLogs() {
    const { data } = await api.get<PaginatedAudit>("/audit-logs", {
      params: {
        page,
        limit,
        entity: entity || undefined,
        action: action || undefined,
      },
    });
    setLogs(data.data);
    setTotal(data.total);
  }

  useEffect(() => {
    void loadLogs();
  }, [page, entity, action]);

  function handleClear() {
    setEntity("");
    setAction("");
    setPage(1);
  }

  function handleExportPDF() {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text("Relatório de Auditoria — Product Manager", 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(120);
    doc.text(`Gerado em: ${new Date().toLocaleString("pt-BR")}`, 14, 28);

    if (entity || action) {
      const filtros = [
        entity ? `Entidade: ${entity}` : "",
        action ? `Ação: ${action}` : "",
      ]
        .filter(Boolean)
        .join(" | ");
      doc.text(`Filtros aplicados: ${filtros}`, 14, 34);
    }

    doc.setTextColor(0);

    autoTable(doc, {
      startY: entity || action ? 40 : 34,
      head: [
        [
          "Usuário",
          "E-mail",
          "Ação",
          "Entidade",
          "ID do Registro",
          "Data/Hora",
        ],
      ],
      body: logs.map((log) => [
        log.user.name,
        log.user.email,
        log.action,
        log.entity,
        log.entityId.slice(0, 8) + "...",
        new Date(log.createdAt).toLocaleString("pt-BR"),
      ]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [37, 99, 235] },
      alternateRowStyles: { fillColor: [241, 245, 249] },
    });

    const filename = `auditoria-${new Date().toISOString().split("T")[0]}.pdf`;
    doc.save(filename);
  }

  return (
    <>
      <section className="mb-6">
        <Typography variant="h1" className="mb-2 dashboard-title">
          Auditoria
        </Typography>
        <Typography variant="p" className="dashboard-subtitle">
          Rastreamento de todas as ações realizadas no sistema
        </Typography>
      </section>

      {/* Filters / Report */}
      <Card elevation="low" className="mb-4">
        <Typography variant="h2" className="mb-4 dashboard-title">
          Filtros
        </Typography>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Dropdown
              label="Entidade"
              value={entity}
              options={entityOptions}
              optionLabel="label"
              optionValue="value"
              onChange={(e) => {
                setEntity(e.value as string);
                setPage(1);
              }}
            />
          </div>
          <div className="flex-1">
            <Dropdown
              label="Ação"
              value={action}
              options={actionOptions}
              optionLabel="label"
              optionValue="value"
              onChange={(e) => {
                setAction(e.value as string);
                setPage(1);
              }}
            />
          </div>
          <div className="flex items-end gap-2">
            <Button label="Limpar Filtros" onClick={handleClear} />
            <Button label="Exportar PDF" onClick={handleExportPDF} />
          </div>
        </div>
        {/* Report summary */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <Typography variant="p" className="dashboard-text-secondary text-sm">
            Total de registros encontrados: <strong>{total}</strong>
            {entity && ` | Entidade: ${entity}`}
            {action && ` | Ação: ${action}`}
          </Typography>
        </div>
      </Card>

      {/* logs table */}
      <Card elevation="low">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b dashboard-border text-left">
                <th className="pb-3 font-semibold dashboard-text-secondary">
                  Usuário
                </th>
                <th className="pb-3 font-semibold dashboard-text-secondary">
                  Ação
                </th>
                <th className="pb-3 font-semibold dashboard-text-secondary hidden sm:table-cell">
                  Entidade
                </th>
                <th className="pb-3 font-semibold dashboard-text-secondary hidden md:table-cell">
                  ID do Registro
                </th>
                <th className="pb-3 font-semibold dashboard-text-secondary hidden lg:table-cell">
                  Data/Hora
                </th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="py-8 text-center dashboard-text-muted"
                  >
                    Nenhum registro encontrado.
                  </td>
                </tr>
              )}
              {logs.map((log) => (
                <tr
                  key={log.id}
                  className="border-b dashboard-border dashboard-row-hover"
                >
                  <td className="py-3 pr-4">
                    <p className="font-medium dashboard-text-primary">
                      {log.user.name}
                    </p>
                    <p className="text-xs dashboard-text-muted">
                      {log.user.email}
                    </p>
                  </td>
                  <td className="py-3 pr-4">
                    <Tag
                      value={log.action}
                      severity={
                        ACTION_COLORS[log.action] as
                          | "success"
                          | "warning"
                          | "danger"
                      }
                    />
                  </td>
                  <td className="py-3 pr-4 hidden sm:table-cell dashboard-text-secondary">
                    {log.entity}
                  </td>
                  <td className="py-3 pr-4 hidden md:table-cell">
                    <span className="text-xs font-mono dashboard-text-muted">
                      {log.entityId.slice(0, 8)}...
                    </span>
                  </td>
                  <td className="py-3 hidden lg:table-cell dashboard-text-muted">
                    {new Date(log.createdAt).toLocaleString("pt-BR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {total > limit && (
          <div className="mt-4 flex justify-center">
            <Paginator
              first={(page - 1) * limit}
              rows={limit}
              totalRecords={total}
              onPageChange={(e) => setPage(Math.floor(e.first / limit) + 1)}
            />
          </div>
        )}
      </Card>
    </>
  );
}
