import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery
} from '@mui/material';
import type { Theme } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import ClearIcon from '@mui/icons-material/Clear';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import FilterAltOffOutlinedIcon from '@mui/icons-material/FilterAltOffOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import { FormEvent, ReactNode, useEffect, useMemo, useState } from 'react';
import { api, getErrorMessage } from '../api/client';
import { maskCnpj, maskPhone, normalizePlate, normalizeState } from './format';
import { EmptyState, TableSkeleton } from './DataState';

type Row = Record<string, any>;

export interface Option {
  value: string | number;
  label: string;
}

export interface ColumnConfig<T extends Row> {
  key: keyof T | string;
  label: string;
  render?: (row: T) => ReactNode;
  minWidth?: number;
}

export interface FieldConfig {
  key: string;
  label: string;
  type?: 'text' | 'number' | 'select' | 'datetime' | 'date' | 'textarea' | 'color';
  options?: Option[];
  required?: boolean;
  xs?: number;
  mask?: 'phone' | 'cnpj' | 'state' | 'plate';
  min?: number;
  max?: number;
}

export interface FilterConfig {
  key: string;
  label: string;
  type?: 'text' | 'select' | 'date';
  options?: Option[];
}

interface CrudPageProps<T extends Row> {
  title: string;
  subtitle: string;
  endpoint: string;
  noun: string;
  searchPlaceholder: string;
  columns: ColumnConfig<T>[];
  fields: FieldConfig[];
  initialValues: Row;
  filters?: FilterConfig[];
  mapToForm?: (row: T) => Row;
  mapToPayload?: (form: Row) => Row;
  filterFn?: (row: T, search: string, filters: Row) => boolean;
  deleteLabel?: string;
}

function valueAt(row: Row, key: string) {
  return key.split('.').reduce<any>((current, part) => current?.[part], row);
}

function applyMask(value: string, mask?: FieldConfig['mask']) {
  if (mask === 'phone') {
    return maskPhone(value);
  }
  if (mask === 'cnpj') {
    return maskCnpj(value);
  }
  if (mask === 'state') {
    return normalizeState(value);
  }
  if (mask === 'plate') {
    return normalizePlate(value);
  }
  return value;
}

function isBlank(value: unknown) {
  return value === undefined || value === null || String(value).trim() === '';
}

export function CrudPage<T extends Row>({
  title,
  subtitle,
  endpoint,
  noun,
  searchPlaceholder,
  columns,
  fields,
  initialValues,
  filters = [],
  mapToForm,
  mapToPayload,
  filterFn,
  deleteLabel = 'Cancelar'
}: CrudPageProps<T>) {
  const [rows, setRows] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<T | null>(null);
  const [form, setForm] = useState<Row>(initialValues);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [rowActionId, setRowActionId] = useState<number | string | null>(null);
  const [search, setSearch] = useState('');
  const [filterValues, setFilterValues] = useState<Row>({});
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(8);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));

  function load() {
    setLoading(true);
    api
      .get<T[]>(endpoint)
      .then((response) => setRows(response.data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, [endpoint]);

  const filteredRows = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    const matcher =
      filterFn ??
      ((row: T, term: string) =>
        !term ||
        columns.some((column) =>
          String(valueAt(row, String(column.key)) ?? '')
            .toLowerCase()
            .includes(term)
        ));

    return rows.filter((row) => matcher(row, normalizedSearch, filterValues));
  }, [rows, filterFn, search, filterValues, columns]);

  const paginatedRows = useMemo(
    () => filteredRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [filteredRows, page, rowsPerPage]
  );

  const activeFilters = useMemo(
    () => Object.values(filterValues).filter((value) => !isBlank(value)).length + (search.trim() ? 1 : 0),
    [filterValues, search]
  );

  function resetPaging() {
    setPage(0);
  }

  function clearFilters() {
    setSearch('');
    setFilterValues({});
    resetPaging();
  }

  function openCreate() {
    setEditing(null);
    setForm({ ...initialValues });
    setFormErrors({});
    setFormError('');
    setDialogOpen(true);
  }

  function openEdit(row: T) {
    setEditing(row);
    setForm(mapToForm ? mapToForm(row) : { ...row });
    setFormErrors({});
    setFormError('');
    setDialogOpen(true);
  }

  function validateForm() {
    const nextErrors: Record<string, string> = {};

    fields.forEach((field) => {
      const value = form[field.key];
      if (field.required && isBlank(value)) {
        nextErrors[field.key] = `${field.label} é obrigatório.`;
        return;
      }

      if (!isBlank(value) && field.type === 'number') {
        const numeric = Number(value);
        if (!Number.isFinite(numeric)) {
          nextErrors[field.key] = 'Informe um número válido.';
          return;
        }
        if (field.min !== undefined && numeric < field.min) {
          nextErrors[field.key] = `O valor mínimo é ${field.min}.`;
        }
        if (field.max !== undefined && numeric > field.max) {
          nextErrors[field.key] = `O valor máximo é ${field.max}.`;
        }
      }
    });

    setFormErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError('');

    if (!validateForm()) {
      setFormError('Revise os campos destacados antes de salvar.');
      return;
    }

    const payload = mapToPayload ? mapToPayload(form) : form;
    setSaving(true);

    try {
      if (editing) {
        await api.put(`${endpoint}/${editing.id}`, payload);
        setMessage(`${noun} atualizado com sucesso.`);
      } else {
        await api.post(endpoint, payload);
        setMessage(`${noun} criado com sucesso.`);
      }
      setDialogOpen(false);
      load();
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function remove(row: T) {
    setRowActionId(row.id);
    try {
      await api.delete(`${endpoint}/${row.id}`);
      setMessage(`${noun} atualizado com sucesso.`);
      load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setRowActionId(null);
    }
  }

  function updateField(field: FieldConfig, value: string) {
    const nextValue = applyMask(value, field.mask);
    setForm((current) => ({ ...current, [field.key]: nextValue }));
    if (formErrors[field.key]) {
      setFormErrors((current) => ({ ...current, [field.key]: '' }));
    }
  }

  function renderField(field: FieldConfig, index: number) {
    const value = form[field.key] ?? '';
    const helperText = formErrors[field.key] || ' ';
    const common = {
      fullWidth: true,
      label: field.label,
      required: field.required,
      value,
      autoFocus: index === 0,
      error: Boolean(formErrors[field.key]),
      helperText,
      onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        updateField(field, event.target.value)
    };

    if (field.type === 'select') {
      return (
        <TextField {...common} select>
          {(field.options ?? []).map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
      );
    }

    if (field.type === 'textarea') {
      return <TextField {...common} multiline minRows={4} />;
    }

    return (
      <TextField
        {...common}
        type={field.type === 'datetime' ? 'datetime-local' : field.type ?? 'text'}
        InputLabelProps={{ shrink: field.type === 'datetime' || field.type === 'date' || field.type === 'color' ? true : undefined }}
        inputProps={{
          min: field.min,
          max: field.max
        }}
      />
    );
  }

  const pageHeader = (
    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} justifyContent="space-between" alignItems={{ md: 'center' }}>
      <Box>
        <Typography variant="h5">{title}</Typography>
        <Typography color="text.secondary">{subtitle}</Typography>
      </Box>
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        <Tooltip title="Atualizar dados">
          <IconButton aria-label={`Atualizar ${title}`} onClick={load} disabled={loading}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
          Novo {noun.toLowerCase()}
        </Button>
      </Stack>
    </Stack>
  );

  return (
    <Stack spacing={2.5} className="page-enter">
      {pageHeader}

      <Card className="soft-card">
        <CardContent>
          <Grid container spacing={1.5} alignItems="center">
            <Grid item xs={12} md={filters.length ? 5 : 9}>
              <TextField
                fullWidth
                aria-label={searchPlaceholder}
                placeholder={searchPlaceholder}
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  resetPaging();
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                  endAdornment: search ? (
                    <InputAdornment position="end">
                      <Tooltip title="Limpar busca">
                        <IconButton aria-label="Limpar busca" size="small" onClick={() => setSearch('')}>
                          <ClearIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </InputAdornment>
                  ) : undefined
                }}
              />
            </Grid>
            {filters.map((filter) => (
              <Grid item xs={12} sm={6} md key={filter.key}>
                <TextField
                  select={filter.type === 'select'}
                  type={filter.type === 'date' ? 'date' : 'text'}
                  fullWidth
                  label={filter.label}
                  value={filterValues[filter.key] ?? ''}
                  InputLabelProps={{ shrink: filter.type === 'date' ? true : undefined }}
                  onChange={(event) => {
                    setFilterValues((current) => ({ ...current, [filter.key]: event.target.value }));
                    resetPaging();
                  }}
                >
                  {filter.type === 'select' ? <MenuItem value="">Todos</MenuItem> : null}
                  {(filter.options ?? []).map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            ))}
            <Grid item xs={12} md="auto">
              <Button
                fullWidth
                variant="outlined"
                startIcon={<FilterAltOffOutlinedIcon />}
                onClick={clearFilters}
                disabled={!activeFilters}
              >
                Limpar
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {loading ? (
        <TableSkeleton rows={8} columns={Math.min(columns.length + 1, 7)} />
      ) : filteredRows.length === 0 ? (
        <EmptyState
          title={`Nenhum ${noun.toLowerCase()} encontrado`}
          description="Ajuste os filtros aplicados ou cadastre um novo item para continuar a operação."
          actionLabel={`Novo ${noun.toLowerCase()}`}
          onAction={openCreate}
        />
      ) : isMobile ? (
        <Stack spacing={1.5}>
          {paginatedRows.map((row, index) => (
            <Card
              key={row.id}
              className="soft-card stagger-item"
              sx={{ animationDelay: `${index * 35}ms` }}
            >
              <CardContent>
                <Stack spacing={1.2}>
                  {columns.slice(0, 5).map((column) => (
                    <Stack direction="row" justifyContent="space-between" gap={2} key={String(column.key)}>
                      <Typography variant="caption" color="text.secondary" fontWeight={850}>
                        {column.label}
                      </Typography>
                      <Box textAlign="right" minWidth={0}>
                        {column.render ? (
                          column.render(row)
                        ) : (
                          <Typography variant="body2">{String(valueAt(row, String(column.key)) ?? '-')}</Typography>
                        )}
                      </Box>
                    </Stack>
                  ))}
                  <Stack direction="row" spacing={1} justifyContent="flex-end" flexWrap="wrap" useFlexGap>
                    <Button size="small" startIcon={<EditOutlinedIcon />} onClick={() => openEdit(row)}>
                      Editar
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      startIcon={rowActionId === row.id ? <CircularProgress color="inherit" size={14} /> : <DeleteOutlineIcon />}
                      onClick={() => remove(row)}
                      disabled={rowActionId === row.id}
                    >
                      {deleteLabel}
                    </Button>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          ))}
          <TablePagination
            component="div"
            count={filteredRows.length}
            page={page}
            onPageChange={(_, nextPage) => setPage(nextPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(event) => {
              setRowsPerPage(Number(event.target.value));
              setPage(0);
            }}
            rowsPerPageOptions={[5, 8, 15]}
            labelRowsPerPage="Itens por página"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
          />
        </Stack>
      ) : (
        <Card className="soft-card">
          <Box sx={{ overflowX: 'auto' }}>
            <Table aria-label={title}>
              <TableHead>
                <TableRow>
                  {columns.map((column) => (
                    <TableCell key={String(column.key)} sx={{ minWidth: column.minWidth }}>
                      {column.label}
                    </TableCell>
                  ))}
                  <TableCell align="right">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedRows.map((row) => (
                  <TableRow hover key={row.id}>
                    {columns.map((column) => (
                      <TableCell key={String(column.key)}>
                        {column.render ? column.render(row) : String(valueAt(row, String(column.key)) ?? '-')}
                      </TableCell>
                    ))}
                    <TableCell align="right">
                      <Stack direction="row" justifyContent="flex-end" spacing={0.5}>
                        <Tooltip title="Editar">
                          <IconButton aria-label={`Editar ${noun} ${row.id}`} onClick={() => openEdit(row)} size="small">
                            <EditOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={deleteLabel}>
                          <IconButton
                            aria-label={`${deleteLabel} ${noun} ${row.id}`}
                            color="error"
                            onClick={() => remove(row)}
                            disabled={rowActionId === row.id}
                            size="small"
                          >
                            {rowActionId === row.id ? <CircularProgress color="inherit" size={16} /> : <DeleteOutlineIcon fontSize="small" />}
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
          <TablePagination
            component="div"
            count={filteredRows.length}
            page={page}
            onPageChange={(_, nextPage) => setPage(nextPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(event) => {
              setRowsPerPage(Number(event.target.value));
              setPage(0);
            }}
            rowsPerPageOptions={[5, 8, 15, 25]}
            labelRowsPerPage="Itens por página"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
          />
        </Card>
      )}

      <Dialog open={dialogOpen} onClose={() => (saving ? undefined : setDialogOpen(false))} fullWidth maxWidth="md">
        <Box component="form" onSubmit={submit}>
          <DialogTitle>{editing ? `Editar ${noun.toLowerCase()}` : `Novo ${noun.toLowerCase()}`}</DialogTitle>
          <DialogContent dividers>
            <Stack spacing={2} pt={0.5}>
              {formError ? <Alert severity="error">{formError}</Alert> : null}
              <Grid container spacing={2}>
                {fields.map((field, index) => (
                  <Grid item xs={12} sm={field.xs ?? 6} key={field.key}>
                    {renderField(field, index)}
                  </Grid>
                ))}
              </Grid>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button
              variant="contained"
              type="submit"
              disabled={saving}
              startIcon={saving ? <CircularProgress color="inherit" size={16} /> : undefined}
            >
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      <Snackbar open={Boolean(message)} autoHideDuration={3200} onClose={() => setMessage('')}>
        <Alert severity="success" variant="filled" onClose={() => setMessage('')}>
          {message}
        </Alert>
      </Snackbar>
      <Snackbar open={Boolean(error)} autoHideDuration={4200} onClose={() => setError('')}>
        <Alert severity="error" variant="filled" onClose={() => setError('')}>
          {error}
        </Alert>
      </Snackbar>
    </Stack>
  );
}
