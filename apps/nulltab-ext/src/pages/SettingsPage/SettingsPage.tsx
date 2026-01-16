import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from '@workspace/shadcn/components/sidebar';
import { Info, NotebookTabs as TabsIcon, Palette, Tag } from 'lucide-react';
import { Suspense, useState } from 'react';

import { AboutSection } from './AboutSection.js';
import { AppearanceSection } from './AppearanceSection.js';
import { TabManagementSection } from './TabManagementSection.js';
import { TopicsSection } from './TopicsSection.js';

type SettingsSection = 'appearance' | 'topics' | 'tabs' | 'about';

const sections = [
  { id: 'appearance' as const, label: 'Appearance', icon: Palette },
  { id: 'topics' as const, label: 'Topics', icon: Tag },
  { id: 'tabs' as const, label: 'Tab Management', icon: TabsIcon },
  { id: 'about' as const, label: 'About', icon: Info },
];

export function SettingsPage() {
  const [activeSection, setActiveSection] =
    useState<SettingsSection>('appearance');

  return (
    <div className="flex min-h-screen justify-center px-8 py-12">
      <div
        className={`
          flex h-fit w-full max-w-5xl flex-col overflow-hidden bg-background
        `}
      >
        {/* Sidebar + Content */}
        <SidebarProvider className="flex-1">
          <Sidebar collapsible="none">
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {sections.map((section) => (
                      <SidebarMenuItem key={section.id}>
                        <SidebarMenuButton
                          isActive={activeSection === section.id}
                          onClick={() => {
                            setActiveSection(section.id);
                          }}
                        >
                          <section.icon className="h-4 w-4" />
                          <span>{section.label}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>
          <SidebarInset className="overflow-y-auto px-6 py-2">
            <div className="max-w-2xl">
              {activeSection === 'appearance' && <AppearanceSection />}
              {activeSection === 'topics' && (
                <Suspense fallback={<div>Loading...</div>}>
                  <TopicsSection />
                </Suspense>
              )}
              {activeSection === 'tabs' && <TabManagementSection />}
              {activeSection === 'about' && <AboutSection />}
            </div>
          </SidebarInset>
        </SidebarProvider>
      </div>
    </div>
  );
}
