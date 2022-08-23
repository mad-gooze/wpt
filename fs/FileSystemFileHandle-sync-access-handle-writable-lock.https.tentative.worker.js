importScripts('/resources/testharness.js');
importScripts('resources/sandboxed-fs-test-helpers.js');

'use strict';

directory_test(async (t, root_dir) =>  {
  const fileHandle = await root_dir.getFileHandle('OPFS.test', {create: true});

  const syncHandle1 = fileHandle.createSyncAccessHandle();
  assert_throws_dom(
    'NoModificationAllowedError',
    () => fileHandle.createSyncAccessHandle());

  syncHandle1.close();
  const syncHandle2 = fileHandle.createSyncAccessHandle();
  syncHandle2.close();
}, 'There can only be one open access handle at any given time');

directory_test(async (t, root_dir) =>  {
  const fooFileHandle = await root_dir.getFileHandle('foo.test', {create: true});
  const barFileHandle = await root_dir.getFileHandle('bar.test', {create: true});

  const fooSyncHandle = fooFileHandle.createSyncAccessHandle();
  t.add_cleanup(() => fooSyncHandle.close());

  const barSyncHandle1 = barFileHandle.createSyncAccessHandle();
  assert_throws_dom(
      'NoModificationAllowedError',
      () => barFileHandle.createSyncAccessHandle());

  barSyncHandle1.close();
  const barSyncHandle2 = barFileHandle.createSyncAccessHandle();
  barSyncHandle2.close();
}, 'An access handle from one file does not interfere with the creation of an' +
     ' access handle on another file');

directory_test(async (t, root_dir) =>  {
  const fooFileHandle = await root_dir.getFileHandle('foo.test', {create: true});
  const barFileHandle = await root_dir.getFileHandle('bar.test', {create: true});

  const fooWritable = await fooFileHandle.createWritable();
  t.add_cleanup(() => fooWritable.close());

  const barSyncHandle = barFileHandle.createSyncAccessHandle();
  t.add_cleanup(() => barSyncHandle.close());
}, 'A writable stream from one file does not interfere with the creation of an' +
     ' access handle on another file');

directory_test(async (t, root_dir) =>  {
  const fooFileHandle = await root_dir.getFileHandle('foo.test', {create: true});
  const barFileHandle = await root_dir.getFileHandle('bar.test', {create: true});

  const fooSyncHandle = fooFileHandle.createSyncAccessHandle();
  t.add_cleanup(() => fooSyncHandle.close());

  const barWritable = await barFileHandle.createWritable();
  t.add_cleanup(() => barWritable.close());
}, 'An access handle from one file does not interfere with the creation of a' +
     ' writable stream on another file');

directory_test(async (t, root_dir) =>  {
  const fileHandle = await root_dir.getFileHandle('OPFS.test', {create: true});

  const syncHandle = fileHandle.createSyncAccessHandle();
  await promise_rejects_dom(
      t, 'NoModificationAllowedError', fileHandle.createWritable());

  syncHandle.close();
  const writable = await fileHandle.createWritable();
  await writable.close();
}, 'Writable streams cannot be created if there is an open access handle');

directory_test(async (t, root_dir) =>  {
  const fileHandle = await root_dir.getFileHandle('OPFS.test', {create: true});

  const writable1 = await fileHandle.createWritable();
  const writable2 = await fileHandle.createWritable();
  assert_throws_dom(
    'NoModificationAllowedError',
    () => fileHandle.createSyncAccessHandle());

  await writable1.close();
  assert_throws_dom(
    'NoModificationAllowedError',
    () => fileHandle.createSyncAccessHandle());

  await writable2.close();
  const syncHandle = fileHandle.createSyncAccessHandle();
  syncHandle.close();
}, 'Access handles cannot be created if there are open Writable streams');

done();
