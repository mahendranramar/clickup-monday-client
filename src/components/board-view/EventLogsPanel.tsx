import React, { useEffect, useState } from "react";
import { Loader } from "@vibe/core";
import { useKonnectify } from "../../hooks";
import { EmptyPlaceholder } from "../common/EmptyPlaceholder";
import { iframeService } from "../../services/iframeService";
import mondaySdk from "monday-sdk-js";
import styles from "./EventLogsPanel.module.css";
const monday = mondaySdk();

export const EventLogsPanel: React.FC = () => {
  const { tenant, ensureToken, isConfigured } = useKonnectify();
  const [loading, setLoading] = useState(true);
  const [iframeUrl, setIframeUrl] = useState<string | null>(null);

  useEffect(() => {
    const build = async () => {
      if (!isConfigured || !tenant) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const token = await ensureToken();
        const url = iframeService.buildBootstrapUrl(tenant.domain, "/iframe-event-logs", token);
        setIframeUrl(url);
        monday.execute('valueCreatedForUser');
      } catch (err) {
        // ignore: will show empty state
      } finally {
        setLoading(false);
      }
    };
    void build();
  }, [tenant, ensureToken, isConfigured]);

  if (!isConfigured) {
    return (
      <EmptyPlaceholder
        title="Not configured"
        description="Event logs appear after you configure and use workflows."
      />
    );
  }

  return (
    <div className={styles.container}>
      {loading && (
        <div className={styles.loader}>
          <Loader size="medium" />
        </div>
      )}
      {!loading && iframeUrl && (
        <iframe className={styles.iframeFull} src={iframeUrl} title="Event Logs" />
      )}
      {!loading && !iframeUrl && (
        <EmptyPlaceholder title="No event logs" description="No event logs available." />
      )}
    </div>
  );
};
