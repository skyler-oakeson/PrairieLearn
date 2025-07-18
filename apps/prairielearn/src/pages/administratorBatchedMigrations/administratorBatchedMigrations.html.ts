import { html } from '@prairielearn/html';
import type {
  BatchedMigrationJobRow,
  BatchedMigrationRow,
  BatchedMigrationStatus,
} from '@prairielearn/migrations';

import { PageLayout } from '../../components/PageLayout.js';

export function AdministratorBatchedMigrations({
  batchedMigrations,
  resLocals,
}: {
  batchedMigrations: BatchedMigrationRow[];
  resLocals: Record<string, any>;
}) {
  const hasBatchedMigrations = batchedMigrations.length > 0;

  return PageLayout({
    resLocals,
    pageTitle: 'Batched migrations',
    navContext: {
      type: 'plain',
      page: 'admin',
      subPage: 'batchedMigrations',
    },
    content: html`
      <div class="card mb-4">
        <div class="card-header bg-primary text-white d-flex align-items-center">
          <h1>Batched migrations</h1>
        </div>
        ${hasBatchedMigrations
          ? html`<div class="list-group list-group-flush">
              ${batchedMigrations.map((migration) => {
                return html`
                  <div class="list-group-item d-flex align-items-center">
                    <a
                      href="${resLocals.urlPrefix}/administrator/batchedMigrations/${migration.id}"
                      class="me-auto"
                    >
                      ${migration.filename}
                    </a>
                    ${MigrationStatusBadge(migration.status)}
                  </div>
                `;
              })}
            </div>`
          : html`<div class="card-body text-center text-secondary">No batched migrations</div>`}
      </div>
    `,
  });
}

export function AdministratorBatchedMigration({
  batchedMigration,
  recentSucceededJobs,
  recentFailedJobs,
  resLocals,
}: {
  batchedMigration: BatchedMigrationRow;
  recentSucceededJobs: BatchedMigrationJobRow[];
  recentFailedJobs: BatchedMigrationJobRow[];
  resLocals: Record<string, any>;
}) {
  return PageLayout({
    resLocals,
    pageTitle: 'Batched migrations',
    navContext: {
      type: 'plain',
      page: 'admin',
      subPage: 'batchedMigrations',
    },
    content: html`
      <div class="card mb-4">
        <div class="card-header bg-primary text-white">
          <h1>Migration details</h1>
        </div>
        <table class="table table-sm two-column-description" aria-label="Migration details">
          <tbody>
            <tr>
              <th>Filename</th>
              <td>${batchedMigration.filename}</td>
            </tr>
            <tr>
              <th>Minimum value</th>
              <td>${batchedMigration.min_value}</td>
            </tr>
            <tr>
              <th>Maximum value</th>
              <td>${batchedMigration.max_value}</td>
            </tr>
            <tr>
              <th>Status</th>
              <td>${MigrationStatusBadge(batchedMigration.status)}</td>
            </tr>
            <tr>
              <th>Created at</th>
              <td>${batchedMigration.created_at.toUTCString()}</td>
            </tr>
            <tr>
              <th>Updated at</th>
              <td>${batchedMigration.updated_at.toUTCString()}</td>
            </tr>
            <tr>
              <th>Started at</th>
              <td>${batchedMigration.started_at?.toUTCString()}</td>
            </tr>
            <tr>
              <th>Actions</th>
              <td>
                <form method="POST">
                  <input type="hidden" name="__csrf_token" value="${resLocals.__csrf_token}" />
                  <button
                    type="submit"
                    name="__action"
                    value="retry_failed_jobs"
                    class="btn btn-primary btn-sm"
                  >
                    Retry failed jobs
                  </button>
                </form>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      ${MigrationJobsCard({
        title: 'Recent succeeded jobs',
        jobs: recentSucceededJobs,
        emptyText: 'No recent succeeded jobs',
      })}
      ${MigrationJobsCard({
        title: 'Recent failed jobs',
        jobs: recentFailedJobs,
        emptyText: 'No recent failed jobs',
      })}
    `,
  });
}

function MigrationStatusBadge(status: BatchedMigrationStatus) {
  switch (status) {
    case 'pending':
      return html`<span class="badge text-bg-secondary">Pending</span>`;
    case 'paused':
      return html`<span class="badge text-bg-secondary">Paused</span>`;
    case 'running':
      return html`<span class="badge text-bg-primary">Running</span>`;
    case 'finalizing':
      return html`<span class="badge text-bg-primary">Finalizing</span>`;
    case 'failed':
      return html`<span class="badge text-bg-danger">Failed</span>`;
    case 'succeeded':
      return html`<span class="badge text-bg-success">Succeeded</span>`;
    default:
      return html`<span class="badge text-bg-warning">Unknown (${status})</span>`;
  }
}

function MigrationJobsCard({
  title,
  jobs,
  emptyText,
}: {
  title: string;
  jobs: BatchedMigrationJobRow[];
  emptyText: string;
}) {
  return html`
    <div class="card mb-4">
      <div class="card-header bg-primary text-white d-flex align-items-center">
        <span class="me-auto">${title}</span>
      </div>
      ${jobs.length > 0
        ? html`<div class="list-group list-group-flush">
            ${jobs.map((job) => {
              let duration: number | null = null;
              if (job.started_at && job.finished_at) {
                duration = job.finished_at.getTime() - job.started_at.getTime();
              }
              const attemptsLabel = job.attempts === 1 ? 'attempt' : 'attempts';
              const attempts = `${job.attempts} ${attemptsLabel}`;
              const summary = `${job.min_value} - ${job.max_value}`;
              const hasData = job.data != null;
              return html`
                <div class="list-group-item d-flex flex-column">
                  ${hasData
                    ? html`
                        <details>
                          <summary>${summary}</summary>

                          <pre class="mt-3 p-3 rounded bg-dark text-white"><code>${JSON.stringify(
                            job.data,
                            null,
                            2,
                          )}</code></pre>
                        </details>
                      `
                    : html`<div>${summary}</div>`}
                  ${job.started_at
                    ? html`
                        <span
                          class="text-muted text-small"
                          style="font-variant-numeric: tabular-nums;"
                        >
                          #${job.id} ran at ${job.started_at.toUTCString()} for ${duration}ms
                          &mdash; ${attempts}
                        </span>
                      `
                    : null}
                </div>
              `;
            })}
          </div>`
        : html`<div class="card-body text-center text-secondary">${emptyText}</div>`}
    </div>
  `;
}
