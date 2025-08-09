import { createContext, ReactNode, useEffect, useRef, useState } from "react";
import { useStorage } from "../hooks/storage";

const REQUEST_NEW_KEY_MESSAGE = "requestNewKeyEncryptionKey" as const;
const NEW_KEY_MESSAGE = "newKeyEncryptionKey" as const;

type MessageDataRequestKey = {
  name: typeof REQUEST_NEW_KEY_MESSAGE;
};

type MessageDataNewKey = {
  name: typeof NEW_KEY_MESSAGE;
  newKeyEncryptionKey: Base64URLString;
};

type MessageData = MessageDataRequestKey | MessageDataNewKey;

type KeysContextType = {
  keyEncryptionKey: Base64URLString | null;
  setNewKeyEncryptionKey: (newKeyEncryptionKey: Base64URLString) => void;
};

export const KeysContext = createContext<KeysContextType>({
  keyEncryptionKey: null,
  setNewKeyEncryptionKey: () => {},
});

type KeysProviderProps = {
  children: ReactNode;
};

/**
 * Shares the keyEncryptionKey across browser tabs and windows with the Broadcast Channel API
 *
 * Keys are stored in the state and in the session storage
 *
 * @param keyEncryptionKey
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Broadcast_Channel_API
 */
const KeysProvider: React.FC<KeysProviderProps> = ({ children }) => {
  const { storeKeyEncryptionKey, getKeyEncryptionKey } = useStorage();
  const [keyEncryptionKey, setKeyEncryptionKey] = useState<Base64URLString | null>(null);
  const channel = useRef<BroadcastChannel>(null);

  const setNewKeyEncryptionKey = (newKeyEncryptionKey: Base64URLString) => {
    storeKeyEncryptionKey(newKeyEncryptionKey);
    setKeyEncryptionKey(newKeyEncryptionKey);
  };

  const publishKeyEncryptionKey = () => {
    const storageKeyEncryptionKey = getKeyEncryptionKey();

    if (channel.current === null) return;
    channel.current.postMessage({
      name: NEW_KEY_MESSAGE,
      newKeyEncryptionKey: storageKeyEncryptionKey,
    });
  };

  const requestKeyEncryptionKey = () => {
    if (channel.current === null) return;

    channel.current.postMessage({
      name: REQUEST_NEW_KEY_MESSAGE,
    });
  };

  const handleNewEncryptionKeyMessage = (data: MessageDataNewKey) => {
    if (data.name !== NEW_KEY_MESSAGE) return;
    setNewKeyEncryptionKey(data.newKeyEncryptionKey);
  };

  const handleRequestEncryptionKeyMessage = (data: MessageDataRequestKey) => {
    if (data.name !== REQUEST_NEW_KEY_MESSAGE) return;
    publishKeyEncryptionKey();
  };

  const handleMessage = (event: MessageEvent<MessageData>) => {
    switch (event.data.name) {
      case "newKeyEncryptionKey":
        handleNewEncryptionKeyMessage(event.data);
        break;
      case "requestNewKeyEncryptionKey":
        handleRequestEncryptionKeyMessage(event.data);
        break;
    }
  };

  useEffect(() => {
    channel.current = new BroadcastChannel("keys-channel");
    channel.current.addEventListener("message", handleMessage);

    const storageKeyEncryptionKey = getKeyEncryptionKey();

    if (storageKeyEncryptionKey) {
      setNewKeyEncryptionKey(storageKeyEncryptionKey);
      publishKeyEncryptionKey();
    } else {
      requestKeyEncryptionKey();
    }

    return () => {
      if (!channel.current) return;

      channel.current.removeEventListener("message", handleMessage);
      channel.current.close();
    };
  }, []);

  return (
    <KeysContext.Provider value={{ keyEncryptionKey, setNewKeyEncryptionKey }}>
      {children}
    </KeysContext.Provider>
  );
};

export default KeysProvider;
