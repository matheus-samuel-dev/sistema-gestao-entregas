import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  MenuItem,
  Skeleton,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery
} from '@mui/material';
import type { Theme } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import { ReactNode, useEffect, useMemo, useState } from 'react';
import { api, getErrorMessage } from '../api/client';
import { EmptyState } from './DataState';

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
  const [search, setSearch] = useState('');
  const [filterValues, setFilterValues] = useState<Row>({});
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
    if (!filterFn) {
      return rows;
    }
    return rows.filter((row) => filterFn(row, search.trim().toLowerCase(), filterValues));
  }, [rows, filterFn, search, filterValues]);

  function openCreate() {
    setEditing(null);
    setForm(initialValues);
    setDialogOpen(true);
  }

  function openEdit(row: T) {
    setEditing(row);
    setForm(mapToForm ? mapToForm(row) : row);
    setDialogOpen(true);
  }

  async function submit() {
    const payload = mapToPayload ? mapToPayload(form) : form;
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
      setError(getErrorMessage(err));
    }
  }

  async function remove(row: T) {
    try {
      await api.delete(`${endpoint}/${row.id}`);
      setMessage(`${noun} atualizado com sucesso.`);
      load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  function renderField(field: FieldConfig) {
    const value = form[field.key] ?? '';
    const common = {
      fullWidth: true,
      label: field.label,
      required: field.required,
      value,
      onChange: (event: React.ChangeEvent<HTMLInputElement>) =>
        setForm((current) => ({ ...current, [field.key]: event.target.value }))
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
      return <TextField {...common} multiline minRows={3} />;
    }

    return <TextField {...common} type={field.type === 'datetime' ? 'datetime-local' : field.type ?? 'text'} InputLabelProps={{ shrink: field.type === 'datetime' || field.type === 'date' ? true : undefined }} />;
  }

  return (
    <Stack spacing={2.5}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} justifyContent="space-between" alignItems={{ md: 'center' }}>
        <Box>
          <Typography variant="h5">{title}</Typography>
          <Typography color="text.secondary">{subtitle}</Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Tooltip title="Atualizar">
            <IconButton aria-label={`Atualizar ${title}`} onClick={load}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
            Novo
          </Button>
        </Stack>
      </Stack>

      <Card>
        <CardContent>
          <Grid container spacing={1.5} alignItems="center">
            <Grid item xs={12} md={filters.length ? 5 : 12}>
              <TextField
                fullWidth
                size="small"
                aria-label={searchPlaceholder}
                placeholder={searchPlaceholder}
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} /> }}
              />
            </Grid>
            {filters.map((filter) => (
              <Grid item xs={12} sm={6} md key={filter.key}>
                <TextField
                  select={filter.type === 'select'}
                  type={filter.type === 'date' ? 'date' : 'text'}
                  size="small"
                  fullWidth
                  label={filter.label}
                  value={filterValues[filter.key] ?? ''}
                  InputLabelProps={{ shrink: filter.type === 'date' ? true : undefined }}
                  onChange={(event) =>
                    setFilterValues((current) => ({ ...current, [filter.key]: event.target.value }))
                  }
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
          </Grid>
        </CardContent>
      </Card>

      {loading ? (
        <Card>
          <CardContent>
            <Stack spacing={1}>
              {Array.from({ length: 7 }).map((_, index) => (
                <Skeleton key={index} height={42} />
              ))}
            </Stack>
          </CardContent>
        </Card>
      ) : filteredRows.length === 0 ? (
        <EmptyState title={`Nenhum ${noun.toLowerCase()} encontrado`} description="Ajuste os filtros ou cadastre um novo item." />
      ) : isMobile ? (
        <Stack spacing={1.5}>
          {filteredRows.map((row) => (
            <Card key={row.id}>
              <CardContent>
                <Stack spacing={1.2}>
                  {columns.slice(0, 5).map((column) => (
                    <Stack direction="row" justifyContent="space-between" gap={2} key={String(column.key)}>
                      <Typography variant="caption" color="text.secondary" fontWeight={800}>
                        {column.label}
                      </Typography>
                      <Box textAlign="right" minWidth={0}>
                        {column.render ? column.render(row) : <Typography variant="body2">{String(valueAt(row, String(column.key)) ?? '-')}</Typography>}
                      </Box>
                    </Stack>
                  ))}
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Button size="small" startIcon={<EditOutlinedIcon />} onClick={() => openEdit(row)}>
                      Editar
                    </Button>
                    <Button size="small" color="error" startIcon={<DeleteOutlineIcon />} onClick={() => remove(row)}>
                      {deleteLabel}
                    </Button>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      ) : (
        <Card>
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
                {filteredRows.map((row) => (
                  <TableRow hover key={row.id}>
                    {columns.map((column) => (
                      <TableCell key={String(column.key)}>
                        {column.render ? column.render(row) : String(valueAt(row, String(column.key)) ?? '-')}
                      </TableCell>
                    ))}
                    <TableCell align="right">
                      <Tooltip title="Editar">
                        <IconButton aria-label={`Editar ${noun} ${row.id}`} onClick={() => openEdit(row)}>
                          <EditOutlinedIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={deleteLabel}>
                        <IconButton aria-label={`${deleteLabel} ${noun} ${row.id}`} color="error" onClick={() => remove(row)}>
                          <DeleteOutlineIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        </Card>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>{editing ? `Editar ${noun}` : `Novo ${noun}`}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} pt={0.5}>
            {fields.map((field) => (
              <Grid item xs={12} sm={field.xs ?? 6} key={field.key}>
                {renderField(field)}
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={submit}>
            Salvar
          </Button>
        </DialogActions>
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
