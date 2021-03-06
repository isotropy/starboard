import { Menu, Tray, MenuItem, BrowserWindow } from "electron";
import * as path from "path";
import { HelmConfig, NetworkConfig } from "./types";
import * as uiHost from "./uiHost";
import * as ui from "./ui";

type ClickEventHandler = (
  menuItem: MenuItem,
  browserWindow: BrowserWindow,
  event: Event
) => void;

type NetworkMenuItem = {
  label: string;
  click?: ClickEventHandler;
  submenu?: {
    label: string;
    click?: ClickEventHandler;
  }[];
};

function makeMenuItemForNetwork(
  network: NetworkConfig,
  config: HelmConfig
): NetworkMenuItem {
  function getLocalSubmenu() {
    // Local sbots have data in the user's home dir.
    // The main sbot lives in '.ssb'.
    return [
      {
        label: !config.activeNetworks.includes(network.name) ? "Start" : "Stop",
        click: () => {}
      },
      {
        label: `Manage Plugins`,
        click: () => ui.networks.managePlugins(network.name)
      },
      {
        label: `Manage Space`
      },
      {
        label: `Configuration`,
        click: () => ui.networks.configuration(network.name)
      }
    ];
  }

  // Remote sbots run on remote servers.
  // Can't be configured via helm.
  // Later we can think about some API to add plugins to a remote sbot
  function getRemoteSubmenu() {
    return [{ label: "Generate Invite" }, { label: "Configuration" }];
  }

  return {
    label: config.activeNetworks.includes(network.name)
      ? `${network.name} (Active)`
      : network.name,
    submenu: network.type === "local" ? getLocalSubmenu() : getRemoteSubmenu()
  };
}

export function createTrayMenu(config: HelmConfig) {
  const tray = new Tray(path.join(__dirname, "../icon.png"));

  const active =
    config.activeNetworks.length > 1
      ? `${config.activeNetworks.length} active`
      : config.activeNetworks.length === 1
        ? `${config.activeNetworks[0]} is active`
        : "inactive";

  const networkItems: NetworkMenuItem[] = config.networks
    .map(n => makeMenuItemForNetwork(n, config))
    .concat({
      label: "Add Networks",
      click: () => ui.networks.add()
    });

  const networkMenu = new MenuItem({
    label: `Networks (${active})`,
    submenu: networkItems
  });

  const apps = new MenuItem({
    label: "Apps (12)",
    submenu: [
      {
        label: "master/Patchwork"
      },
      {
        label: "master/Patchbay"
      },
      {
        label: "intranet/Taskbutt"
      },
      {
        label: "Add Apps"
      }
    ]
  });

  const settings = new MenuItem({
    label: "Settings"
  });

  const quit = new MenuItem({
    label: "Quit",
    click: () => uiHost.quit()
  });

  const menu = new Menu();
  menu.append(networkMenu);
  menu.append(apps);
  menu.append(settings);
  menu.append(quit);
  tray.setToolTip("Helm for Secure ScuttleButt.");
  tray.setContextMenu(menu);
}

export function updateMenu() {}
