import React, { useEffect, useState } from "react";
import { Loader, Tab, TabList, TabPanel, TabPanels } from "@vibe/core";
import { useKonnectify } from "../../hooks";
import { EventLogsPanel } from "./EventLogsPanel";
import { WorkflowTable } from "./WorkflowTable";
import { BillingDashboard } from "./BillingDashboard";
import styles from "./BoardView.module.css";
import mondaySdk from "monday-sdk-js";
import { BillingSummary, BillingCredits } from "../../types/index";
const monday = mondaySdk();

export const BoardView: React.FC = () => {
  const { loading, client } = useKonnectify();
  const [activeTab, setActiveTab] = useState(0);
  const [billingData, setBillingData] = useState<BillingSummary | null>(null);
  const [billingLoading, setBillingLoading] = useState(true);
  const [billingError, setBillingError] = useState<string | null>(null);
  const [billingCredits, setBillingCredits] = useState<BillingCredits | null>(null)

  async function getBillingData() {
    if (!client){
      setBillingLoading(true);
      setBillingError(null);
      setBillingData(null);
      setBillingCredits(null);
      return;
    } 
    setBillingLoading(true);
    setBillingError(null);
    try {
      const billings = await client.getBillingInfo2();
      const credits = await client.getBillingCredits();
      setBillingData(billings);
      setBillingCredits(credits);
      monday.execute('valueCreatedForUser');
    } catch (err) {
      setBillingError(
        err instanceof Error ? err.message : "Failed to load billing information",
      );
    } finally {
      setBillingLoading(false);
    }
  }

  useEffect(() => {
    getBillingData();
  }, [client]);

  if (loading) {
    return (
      <div className={styles.loaderWrapper}>
        <Loader size="medium" />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Konnectify</h1>
          <p className={styles.subtitle}>Monitor and manage your integration workflows</p>
        </div>
      </div>

      <div className={styles.tabsWrapper}>
        <TabList activeTabId={activeTab} onTabChange={setActiveTab}>
          <Tab value={0}>Konnectors</Tab>
          <Tab value={1}>Event Logs</Tab>
          <Tab value={2}>Billing Dashboard</Tab>
        </TabList>

        <TabPanels activeTabId={activeTab}>
          <TabPanel index={0}>
            <div className={styles.panel}>
              <WorkflowTable />
            </div>
          </TabPanel>
          <TabPanel index={1}>
            <div className={styles.panel}>
              <EventLogsPanel />
            </div>
          </TabPanel>
          <TabPanel index={2}>
            <div className={styles.panel}>
              <BillingDashboard
                data={billingData}
                loading={billingLoading}
                error={billingError ?? undefined}
                billingCredits={billingCredits}
              />
            </div>
          </TabPanel>
        </TabPanels>
      </div>
    </div>
  );
};

