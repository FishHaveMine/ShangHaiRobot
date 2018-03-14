let local = window.localStorage;

export class LocalstorageService {
  public set(key: string, value: any) {
    local.setItem(key, JSON.stringify(value));
  }

  public get(key: string) {
    let value = local.getItem(key);
    if (value && value.length > 0) {
      return JSON.parse(value);
    }
    return null;
  }

  public remove(key: string) {
    return local.removeItem(key);
  }

  public removeAll() {
    return local.clear();
  }
}