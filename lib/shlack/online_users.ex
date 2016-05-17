defmodule Shlack.OnlineUsers do
  use GenServer

  def init([talk]) do
  	:gproc.reg({:n, :l, talk})
    {:ok, []}
  end

  def add_user(talk, user) do
  	GenServer.cast({:via, :gproc, {:n, :l, talk}}, {:add_user, {user, talk}})
  end

  def del_user(talk, user) do
  	GenServer.cast({:via, :gproc, {:n, :l, talk}}, {:del_user, {user, talk}})
  end

  def handle_cast({:add_user, {user, talk}}, state) do
  	IO.inspect "Joined #{inspect user} in talk #{inspect talk} in process #{inspect self()} of users #{inspect [user | state]}"
  	users = Enum.uniq([user | state])
  	Shlack.Endpoint.broadcast! "rooms:" <> talk, "user_list_updated", %{users: users}
    {:noreply, [user | state]}
  end

  def handle_cast({:del_user, {user, talk}}, state) do
  	IO.inspect "Left #{inspect user} in talk #{inspect talk} in process #{inspect self()} of users #{inspect (state--[user])}"
  	users = Enum.uniq(state --[user])
  	Shlack.Endpoint.broadcast! "rooms:" <> talk, "user_list_updated", %{users: users}

  	if (state --[user]) == [], do: :gproc.unreg({:n, :l, talk})
    {:noreply, (state --[user])}
  end

  def exists?(talk) do
  	if :gproc.where({:n, :l, talk}) != :undefined do
  	  :ok
  	else
  	  :not_found
  	end
  end
end